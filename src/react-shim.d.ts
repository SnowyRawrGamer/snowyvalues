// TypeScript compatibility shim for JSX event annotations used by the app.
import type { ChangeEvent as ReactChangeEvent } from 'react';

declare global {
  namespace React {
    type ChangeEvent<T = Element> = ReactChangeEvent<T>;
  }
}

export {};