import * as acorn from 'acorn';
import { generate } from 'astring';

export class CodeTransformer {
    static transform(code: string): string {
        try {
            const ast = acorn.parse(code, { ecmaVersion: 2020, locations: true }) as any;

            // Find the main function node
            let funcNode: any = null;
            const findFunc = (node: any) => {
                if (!node) return;
                if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
                    funcNode = node;
                    return;
                }
                // Very basic shallow search for top-level function
                if (node.body && Array.isArray(node.body)) {
                    node.body.forEach(findFunc);
                }
            };
            findFunc(ast);

            if (!funcNode) return code;

            // Recursive function to ensure blocks and inject line trackers
            const instrument = (node: any) => {
                if (!node) return;

                // If node is a Function (Declaration/Expression), we need to inject __enter at start and __exit at returns/end.
                // But we are traversing top-down. 
                // We only care about the user's function if it recurses?
                // Actually, user defines `function mergeSort(arr, l, r)`.
                // We want to track calls to this function.
                // EASIER: Track CALLS? `mergeSort(...)` -> `__enter('mergeSort', [args]); mergeSort(...); __exit();`
                // No, that wraps the call site.
                // BETTER: Wrap the function BODY.
                // When body starts: `__enter(name, args)`. 
                // When body returns: `__exit()`.

                // Let's identify Function nodes.
                if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
                    // We need to inject `__enter` at start of body.
                    // And `__exit` before returns.

                    const funcName = node.id ? node.id.name : 'anonymous';
                    // We can capture arguments too? `arguments` object is available in non-arrow functions.
                    // Or explicitly map params?

                    // We need to modify node.body.
                    // node.body is always a BlockStatement for these types? Yes.

                    const originalBody = node.body.body; // Array of statements

                    // Inject __enter at start
                    const enterStmt = {
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'CallExpression',
                            callee: { type: 'Identifier', name: '__enter' },
                            arguments: [
                                { type: 'Literal', value: funcName },
                                // Pass arguments? We can use 'arguments' keyword if strict mode allows, 
                                // or just Array.from(arguments)
                                // But 'arguments' is cleaner in JS.
                                // But we want to visualize them?
                                // Let's passed 'arguments' identifier if available, or empty.
                                // For now just name.
                                { type: 'Identifier', name: 'Array.from(arguments)' }
                                // AST for `Array.from(arguments)`:
                                // CallExpression(MemberExpression(Array, from), [Identifier(arguments)])
                            ]
                        }
                    };

                    // Fix AST for arguments properly
                    enterStmt.expression.arguments = [
                        { type: 'Literal', value: funcName },
                        {
                            type: 'CallExpression',
                            callee: {
                                type: 'MemberExpression',
                                object: { type: 'Identifier', name: 'Array' },
                                property: { type: 'Identifier', name: 'from' }
                            },
                            arguments: [{ type: 'Identifier', name: 'arguments' }]
                        }
                    ] as any;

                    // We will prepend this to the new body structure.

                    // We also need to search for ReturnStatements in the body and inject __exit before them.
                    // We need a separate recursive walker for this scope (don't cross into nested functions).

                    const injectExit = (n: any) => {
                        if (!n) return;
                        // Don't dive into nested functions (they have their own scope/hooks)
                        if (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') {
                            return;
                        }

                        if (n.type === 'ReturnStatement') {
                            // We can't easily insert *before* a node if we are just traversing the node.
                            // We need to be traversing the parent block.
                            // Or replace `ReturnStatement` with `BlockStatement` containing `__exit(); return ...;`
                            // But `ReturnStatement` might be in a place where Block is allowed? 
                            // If it's `if (x) return;`, then `if (x) { __exit(); return; }` works.
                            // But we are using `instrument` which handles block wrapping!
                            // So we can assume most flows are blocks.
                            // BUT `astring` generation might fail if we replace a ReturnStatement node in-place?
                            // We can't replace `n`. We iterate arrays.
                        }

                        // If we find props with arrays...
                        ['body', 'consequent', 'alternate'].forEach(key => {
                            if (Array.isArray(n[key])) {
                                const list = n[key];
                                for (let i = 0; i < list.length; i++) {
                                    if (list[i].type === 'ReturnStatement') {
                                        // Insert exit before
                                        list.splice(i, 0, {
                                            type: 'ExpressionStatement',
                                            expression: {
                                                type: 'CallExpression',
                                                callee: { type: 'Identifier', name: '__exit' },
                                                arguments: []
                                            }
                                        });
                                        i++; // Skip the return we just shifted
                                    } else {
                                        injectExit(list[i]);
                                    }
                                }
                            } else if (n[key]) {
                                // Single child. If it is return, wrap it.
                                if (n[key].type === 'ReturnStatement') {
                                    n[key] = {
                                        type: 'BlockStatement',
                                        body: [
                                            {
                                                type: 'ExpressionStatement',
                                                expression: {
                                                    type: 'CallExpression',
                                                    callee: { type: 'Identifier', name: '__exit' },
                                                    arguments: []
                                                }
                                            },
                                            n[key]
                                        ]
                                    };
                                } else {
                                    injectExit(n[key]);
                                }
                            }
                        });
                    };

                    // Run exit injector on the body (excluding the enter we just added)
                    // We need to start after index 0.
                    // Actually, `injectExit` works on nodes. pass `node`.
                    // But careful not to infinite loop on the enter call? 
                    // enter call is ExpressionStatement, not Return. Safe.
                    // injectExit(node.body); // This approach is replaced by try...finally

                    // Finally, if function has implicit return at end (no explicit return), call exit.
                    // We perform a `try { body } finally { __exit() }` structure? 
                    // That handles ALL cases (early returns, throws, implicit end).
                    // THIS IS CLEVERER.
                    // `__enter(); try { ... original body ... } finally { __exit(); }`
                    // But `arguments` is scoped. 
                    // This structure is robust.

                    const tryFinally = {
                        type: 'TryStatement',
                        block: {
                            type: 'BlockStatement',
                            body: [...originalBody] // All original statements go here
                        },
                        handler: null,
                        finalizer: {
                            type: 'BlockStatement',
                            body: [{
                                type: 'ExpressionStatement',
                                expression: {
                                    type: 'CallExpression',
                                    callee: { type: 'Identifier', name: '__exit' },
                                    arguments: []
                                }
                            }]
                        }
                    };

                    // Reset body to: [Enter, TryFinally]
                    // Enter statement we created earlier
                    node.body.body = [enterStmt, tryFinally];

                    // Resume instrumentation of children inside the try block
                    // We need to recurse into the ORIGINAL statements (now inside try block)
                    // to inject line numbers!
                    // `instrument` handles `body` iteration.
                    // We just manually call it on the `try` block.

                    // Wait, `instrument` handles Function nodes by just recursing?
                    // If we hijack the structure, we need to ensure we don't double-instrument or skip.
                    // Let's perform THIS function wrapping FIRST, then let the generic `instrument` line-injector run?
                    // Or handle both in one pass.

                    // If I do `instrument(child)` below, it works.
                    // Point `instrument` to the TRY block.
                    instrument(tryFinally.block);

                    return; // Stop processing this node, we handled it and its children.
                }

                // Standard instrumentation (Line Numbers)
                // Properties that contain statements/blocks
                const props = ['body', 'consequent', 'alternate'];

                props.forEach(prop => {
                    if (!node[prop]) return;

                    if (Array.isArray(node[prop])) {
                        // It's an array of statements (e.g., BlockStatement body)
                        const newBody = [];
                        for (const child of node[prop]) {
                            // Inject tracker before the statement
                            if (child.loc) {
                                newBody.push({
                                    type: 'ExpressionStatement',
                                    expression: {
                                        type: 'CallExpression',
                                        callee: { type: 'Identifier', name: '__line' },
                                        arguments: [{ type: 'Literal', value: child.loc.start.line }]
                                    }
                                });
                            }
                            instrument(child);
                            newBody.push(child);
                        }
                        node[prop] = newBody;
                    } else {
                        // It's a single node (e.g., if (cond) stmt;)
                        // We wrap it in a block: if (cond) { __line(L); stmt; }
                        const child = node[prop];
                        // Don't wrap if it's already a block, just recurse
                        if (child.type === 'BlockStatement') {
                            instrument(child);
                        } else {
                            // Wrap single statement in block
                            const block: any = {
                                type: 'BlockStatement',
                                body: [],
                                loc: child.loc
                            };
                            if (child.loc) {
                                block.body.push({
                                    type: 'ExpressionStatement',
                                    expression: {
                                        type: 'CallExpression',
                                        callee: { type: 'Identifier', name: '__line' },
                                        arguments: [{ type: 'Literal', value: child.loc.start.line }]
                                    }
                                });
                            }
                            instrument(child);
                            block.body.push(child);
                            node[prop] = block;
                        }
                    }
                });
            };

            // Start instrumentation from the function body
            instrument(funcNode);

            return generate(ast);

        } catch (e) {
            console.error('Transform error:', e);
            return code;
        }
    }
}
