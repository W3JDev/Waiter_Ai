// QR Code Generation System for WaiterAI Enterprise
import QRCode from 'qrcode'

export interface QRCodeOptions {
  size?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
  logo?: string
}

export class QRCodeGenerator {
  /**
   * Generate QR code for restaurant menu
   */
  async generateMenuQR(
    restaurantId: string,
    tableName?: string,
    options: QRCodeOptions = {}
  ): Promise<{ url: string; qrCode: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://waiter-ai.vercel.app'
    const menuUrl = `${baseUrl}/menu/${restaurantId}${tableName ? `?table=${tableName}` : ''}`
    
    const qrOptions = {
      width: options.size || 512,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      },
      errorCorrectionLevel: 'M' as const
    }

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, qrOptions)
      return {
        url: menuUrl,
        qrCode: qrCodeDataUrl
      }
    } catch (error) {
      console.error('QR Code generation failed:', error)
      throw new Error('Failed to generate QR code')
    }
  }

  /**
   * Generate bulk QR codes for multiple tables
   */
  async generateBulkQRCodes(
    restaurantId: string,
    tableNames: string[],
    options: QRCodeOptions = {}
  ): Promise<Array<{ table: string; url: string; qrCode: string }>> {
    const results = await Promise.all(
      tableNames.map(async (tableName) => {
        const { url, qrCode } = await this.generateMenuQR(restaurantId, tableName, options)
        return { table: tableName, url, qrCode }
      })
    )
    
    return results
  }

  /**
   * Generate QR code with custom branding
   */
  async generateBrandedQR(
    restaurantId: string,
    restaurantName: string,
    logoUrl?: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const { qrCode } = await this.generateMenuQR(restaurantId, undefined, options)
    
    // In a full implementation, this would overlay the logo onto the QR code
    // For now, return the basic QR code
    return qrCode
  }
}

export const qrGenerator = new QRCodeGenerator()