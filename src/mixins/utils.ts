import { SocketActions } from '@/socketActions'
import Vue from 'vue'
import Component from 'vue-class-component'
import { Globals, Waits } from '@/globals'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

@Component({})
export default class UtilsMixin extends Vue {
  waits = Waits
  logoImage: HTMLImageElement | undefined = undefined

  get pageTitle () {
    const instanceName = this.$store.state.config.fileConfig.general.instanceName || ''
    let progress = this.$store.state.socket.printer.display_status.progress || 0
    progress = (progress * 100).toFixed()
    let pageName = ''
    if (this.$data.pageName) {
      pageName = this.$data.pageName
    }
    if (this.printerPrinting) {
      return `[${progress}%] | ${pageName} | ${instanceName}`
    } else {
      return `${pageName} | ${instanceName}`
    }
  }

  get pageIcon () {
    let iconUrl = null
    if (this.logoImage === undefined) {
      this.logoImage = new Image()
      this.logoImage.src = require('@/assets/logo.svg')
    }
    if (this.printerPrinting) {
      let progress = this.$store.state.socket.printer.display_status.progress || 0
      progress = (progress * 100).toFixed()
      const faviconSize = 64
      const canvas = document.createElement('canvas') as HTMLCanvasElement
      canvas.width = faviconSize
      canvas.height = faviconSize
      const context = canvas.getContext('2d')
      if (context !== null) {
        const centerX = faviconSize / 2
        const centerY = faviconSize / 2
        const lineWidth = 8
        const radius = faviconSize / 2 - lineWidth / 2
        const startAngle = 1 * Math.PI
        const endAngle = startAngle + (progress * 2 * Math.PI / 100)
        const logoSize = (radius * 2) / Math.sqrt(2)
        context.moveTo(centerX, centerY)
        context.beginPath()
        context.arc(centerX, centerY, radius, startAngle, endAngle, false)
        context.strokeStyle = '#2196F3'
        context.lineWidth = lineWidth
        context.stroke()
        if (this.logoImage.complete) {
          context.drawImage(this.logoImage, (faviconSize - logoSize) / 2, (faviconSize - logoSize) / 2, logoSize, logoSize)
        }
        iconUrl = canvas.toDataURL('image/png')
      }
    }
    return {
      'link[rel="icon"][sizes="32x32"]': {
        href: iconUrl || `${process.env.BASE_URL}img/icons/favicon-32x32.png`
      },
      'link[rel="icon"][sizes="16x16"]': {
        href: iconUrl || `${process.env.BASE_URL}img/icons/favicon-16x16.png`
      }
    }
  }

  get apiUrl () {
    return this.$store.state.config.apiUrl
  }

  get socketConnected () {
    return this.$store.getters['socket/getConnectionState']
  }

  get socketConnecting () {
    return this.$store.getters['socket/getConnectingState']
  }

  get klippyConnected () {
    return this.$store.getters['socket/getKlippyConnected']
  }

  get klippyState () {
    return this.$store.getters['socket/getKlippyState']
  }

  get klippyStateMessage () {
    return this.$store.getters['socket/getKlippyStateMessage']
  }

  // Return the printer state
  get printerState () {
    return this.$filters.startCase(this.$store.getters['socket/getPrinterState'])
  }

  // Returns a boolean indicating if the printer is busy in some way..
  get printerBusy () {
    const printerState = this.printerState.toLowerCase()
    if (
      printerState === 'printing' ||
      printerState === 'paused' ||
      printerState === 'busy'
    ) {
      return true
    }
    return false
  }

  get printerPaused () {
    const printerState = this.printerState.toLowerCase()
    if (
      printerState === 'paused'
    ) {
      return true
    }
    return false
  }

  get xyHomed (): boolean {
    return this.$store.getters['socket/getHomedAxes']('xy')
  }

  get xHomed (): boolean {
    return this.$store.getters['socket/getHomedAxes']('x')
  }

  get yHomed (): boolean {
    return this.$store.getters['socket/getHomedAxes']('y')
  }

  get zHomed (): boolean {
    return this.$store.getters['socket/getHomedAxes']('z')
  }

  /**
   * Returns a boolean indicating of the printer is printing.
   * (versus busy in some other way...)
   */
  get printerPrinting () {
    const printerState = this.printerState.toLowerCase()
    if (printerState === 'printing') return true
    return false
  }

  /**
   * Indicates if we have a valid wait.
   */
  hasWait (wait: string) {
    return this.$store.getters['socket/hasWait'](wait)
  }

  /**
   * Indicates if we have any waits.
   */
  get hasWaits () {
    return this.$store.getters['socket/hasWaits']
  }

  get printerSupportsQgl (): boolean {
    return 'quad_gantry_level' in this.$store.state.socket.printer.configfile.config
  }

  get printerSupportsZtilt (): boolean {
    return 'z_tilt' in this.$store.state.socket.printer.configfile.config
  }

  get printerSupportsBedScrews (): boolean {
    return 'bed_screws' in this.$store.state.socket.printer.configfile.config
  }

  get printerSupportsBedScrewsCalculate (): boolean {
    return 'screws_tilt_adjust' in this.$store.state.socket.printer.configfile.config
  }

  get allHomed (): boolean {
    return this.$store.getters['socket/getHomedAxes']('xyz')
  }

  restartKlippy () {
    this.sendGcode('RESTART', Waits.onRestart)
    // this.$store.commit('socket/resetState')
  }

  firmwareRestartKlippy () {
    this.sendGcode('FIRMWARE_RESTART', Waits.onFirmwareRestart)
    // this.$store.commit('socket/resetState')
  }

  /**
   * Send a gcode script.
   */
  sendGcode (gcode: string, wait?: string) {
    if (wait) this.$store.dispatch('socket/addWait', wait)
    SocketActions.printerGcodeScript(gcode, wait)
    this.$store.dispatch('socket/addConsoleEntry', { message: `${Globals.CONSOLE_SEND_PREFIX} ${gcode}` })
  }

  /**
   * Send a move gcode script.
   */
  sendMoveGcode (axis: string, distance: string, negative = false) {
    axis = axis.toLowerCase()
    const inverted = this.$store.state.config.fileConfig.general.axis[axis].inverted || false
    distance = ((negative && !inverted) || (!negative && inverted))
      ? '-' + distance
      : distance

    this.sendGcode(`G91
      G1 ${axis}${distance} F6000
      G90`)
  }

  /**
   * Send a Z adjust gcode script.
   */
  sendZAdjustGcode (direction: '+' | '-', distance: string, wait?: string) {
    const gcode = `SET_GCODE_OFFSET Z_ADJUST=${direction}${distance} MOVE=1`
    this.sendGcode(gcode, wait)
  }

  /**
   * Retract.
   */
  sendRetractGcode (amount: number, rate: number, wait?: string) {
    const gcode = `M83
      G1 E-${amount} F${rate * 60}`
    this.sendGcode(gcode, wait)
  }

  /**
   * Extrude.
   */
  sendExtrudeGcode (amount: number, rate: number, wait?: string) {
    const gcode = `M83
      G1 E${amount} F${rate * 60}`
    this.sendGcode(gcode, wait)
  }

  getFile (path: string, options?: AxiosRequestConfig) {
    const filepath = path
    const o = { ...options }
    return this.$http.get(
      this.apiUrl + filepath + '?date' + new Date().getTime(),
      o
    )
  }

  download (file: string, path: string) {
    const filename = file || ''
    this.getFile(`/server/files/${path}/${file}`, { responseType: 'blob' })
      .then((response: AxiosResponse) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
      })
  }
}
