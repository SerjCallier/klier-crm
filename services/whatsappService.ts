
export interface WhatsAppCredentials {
  token: string;
  phoneNumberId: string;
}

export const sendWhatsAppMessage = async (
  to: string, 
  message: string, 
  creds: WhatsAppCredentials
) => {
  // Limpiar el número de teléfono (debe tener código de país sin + ni espacios)
  const cleanPhone = to.replace(/\D/g, '');

  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${creds.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${creds.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "text",
          text: {
            preview_url: false,
            body: message
          }
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al enviar por WhatsApp');
    }
    return { success: true, data };
  } catch (error: any) {
    console.error("WhatsApp API Error:", error);
    return { success: false, error: error.message };
  }
};
