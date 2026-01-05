import type { Component } from 'vue'

export interface NavItem {
    label: string
    to: string
    abbr: string
    icon: Component
}

export interface HealthStatus {
    isConnected: boolean;
    connectionError: string;
    checkingConnection: boolean;
    connectionMessage: string;
    connectionStatusClass: string;
}
