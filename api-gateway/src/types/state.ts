export enum State {
  Init = 'INIT' /* everything (except logs) is set to initial state,
                      service 1 starts sending again, and state is set to running */,
  Paused = 'PAUSED', // = service 1 does not send msgs
  Running = 'RUNNING', // = service 2 sends msgs
  Shutdown = 'SHUTDOWN' // all containers are stopped
}
