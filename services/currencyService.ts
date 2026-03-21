
import axios from 'axios';

// Utilizando una API gratuita y confiable para divisas (ej. ExchangeRate-API o similar)
// Para propósitos de este sprint, usaremos una estructura que permita fallback
const API_URL = 'https://open.er-api.com/v6/latest/USD';

export interface ExchangeRates {
    USD: number;
    ARS: number;
    EUR: number;
    BRL: number;
    lastUpdate: string;
}

export const getLatestRates = async (): Promise<ExchangeRates> => {
    try {
        const response = await axios.get(API_URL);
        const rates = response.data.rates;
        return {
            USD: 1,
            ARS: rates.ARS,
            EUR: rates.EUR,
            BRL: rates.BRL,
            lastUpdate: response.data.time_last_update_utc
        };
    } catch (error) {
        console.error("Error fetching currency rates:", error);
        // Fallback aproximado si la API falla
        return {
            USD: 1,
            ARS: 1000,
            EUR: 0.92,
            BRL: 4.95,
            lastUpdate: new Date().toISOString()
        };
    }
};

export const convertCurrency = (amount: number, from: keyof ExchangeRates, to: keyof ExchangeRates, rates: ExchangeRates): number => {
    // Para simplificar, convertimos todo a la base (USD) y luego a la destino
    const baseAmount = amount / (rates[from] as number);
    return baseAmount * (rates[to] as number);
};
