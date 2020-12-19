import { ConfigState } from './config/types'
import { FilesState } from './files/types'
import { SocketState } from './socket/types'
import { VersionState } from './version/types'

export interface RootState {
  config?: ConfigState;
  files?: FilesState;
  socket?: SocketState;
  version?: VersionState;
}
