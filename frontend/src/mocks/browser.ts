import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/authHandlers';
import { roomHandlers } from './handlers/roomHandlers';
import { messageHandlers } from './handlers/messageHandlers';
import { argumentHandlers } from './handlers/argumentHandlers';

export const worker = setupWorker(
  ...authHandlers,
  ...roomHandlers,
  ...messageHandlers,
  ...argumentHandlers,
);
