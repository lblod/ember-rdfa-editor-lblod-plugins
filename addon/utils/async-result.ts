import { tracked } from '@glimmer/tracking';
import { type State } from 'reactiveweb/function';

export interface AsyncResult<Return = unknown> extends Promise<Return> {
  readonly value: Return | null;
  readonly error: unknown;
  readonly isSuccessful: boolean;
  readonly isError: boolean;
  readonly isFinished: boolean;
  readonly isRunning: boolean;
}

export class AsyncStateResult<Return = unknown>
  extends Promise<Return>
  implements AsyncResult<Return>
{
  @tracked value: Return | null = null;
  @tracked error: unknown = null;
  @tracked isSuccessful = false;
  @tracked isError = false;
  @tracked isFinished = false;
  @tracked isRunning = true;

  constructor(state: State<Promise<Return>>) {
    super((resolve, reject) => {
      state.promise
        .then((res) => {
          this.value = res;
          this.isSuccessful = true;
          this.isFinished = true;
          this.isRunning = false;
          resolve(res);
        })
        .catch((err) => {
          this.error = err;
          this.isError = true;
          this.isFinished = true;
          this.isRunning = false;
          reject(err);
        });
    });
  }
}

export function asyncResultFromState<Return>(
  state: State<Promise<Return>>,
): AsyncResult<Return> {
  return new AsyncStateResult(state);
}
