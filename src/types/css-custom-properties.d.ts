/*
 * Custom properties in an inline `style`, as a type the compiler accepts.
 *
 * React has always written `--x` through to the element untouched — it skips
 * the unit-appending path for anything starting with two dashes, so a number
 * arrives as `210` rather than `210px` — but csstype's `Properties` has no
 * index signature, so the object literal is a type error at every call site.
 * The alternatives were a cast per site or a widened prop, and both of those
 * lose real checking on the standard properties in the same object.
 *
 * This is the narrow version of the escape: the key has to look like a custom
 * property, so a misspelled `bakcgroundColor` is still caught.
 */
import 'react';

declare module 'react' {
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
