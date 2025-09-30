// Temporary shared types during Flow -> TS migration
// Add Flow utility type shims as needed here to unblock gradual conversion.

// Exact object types in Flow ({| |}) behave like TS's exact object typing by default.
// We provide a helper for readability when porting docs.
type Exact<T> = { [K in keyof T]: T[K] } & { };
