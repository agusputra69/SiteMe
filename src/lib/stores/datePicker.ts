import { writable } from 'svelte/store';

// Global store to manage which date picker is currently open
// Only one picker can be open at a time
export const activePickerId = writable<string | null>(null);

// Function to open a specific picker and close all others
export function openPicker(pickerId: string) {
	activePickerId.set(pickerId);
}

// Function to close the currently active picker
export function closePicker() {
	activePickerId.set(null);
}

// Function to check if a specific picker is active
export function isPickerActive(pickerId: string, currentActiveId: string | null): boolean {
	return currentActiveId === pickerId;
}