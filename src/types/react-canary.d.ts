/// <reference types="react/canary" />

/*
 * App Router runs on a React canary, which is where <ViewTransition> lives.
 * The runtime already has it — Next bundles that build — but the published
 * @types/react ships the declaration in a separate entry point that nothing
 * pulls in by default, so without this line the import is a type error.
 *
 * ARCHITECTURE.md §5.4. Delete when ViewTransition reaches a stable React.
 */
