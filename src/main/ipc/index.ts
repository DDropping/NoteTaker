import { registerFileHandlers } from './fileHandlers';
import { registerConfigHandlers } from './configHandlers';
import { registerSearchHandlers } from './searchHandlers';

export function registerAllHandlers() {
  registerFileHandlers();
  registerConfigHandlers();
  registerSearchHandlers();
}
