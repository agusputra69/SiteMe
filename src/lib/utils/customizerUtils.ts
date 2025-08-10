/**
 * Utility functions for the Template Customizer component
 * Contains helper functions for customization management, accessibility, and drag-and-drop
 */

import type { CustomizationConfig } from './customizerConfig';
import { DEFAULT_CUSTOMIZATION, SECTION_LABELS } from './customizerConfig';

/**
 * Creates a deep clone of the customization object
 */
export function cloneCustomization(customization: CustomizationConfig): CustomizationConfig {
	return JSON.parse(JSON.stringify(customization));
}

/**
 * Validates and ensures customization object has all required properties
 */
export function validateCustomization(customization: Partial<CustomizationConfig>): CustomizationConfig {
	return {
		...DEFAULT_CUSTOMIZATION,
		...customization
	};
}

/**
 * Announces changes to screen readers for accessibility
 */
export function announceChange(message: string): void {
	const announcement = document.createElement('div');
	announcement.setAttribute('aria-live', 'polite');
	announcement.setAttribute('aria-atomic', 'true');
	announcement.className = 'sr-only';
	announcement.textContent = message;
	document.body.appendChild(announcement);
	
	setTimeout(() => {
		if (document.body.contains(announcement)) {
			document.body.removeChild(announcement);
		}
	}, 1000);
}

/**
 * Focuses the first focusable element in the customizer
 */
export function focusFirstElement(): void {
	const firstButton = document.querySelector('button') as HTMLElement;
	if (firstButton) {
		firstButton.focus();
	}
}

/**
 * Exports customization settings as a JSON file
 */
export function exportCustomizationToFile(
	customization: CustomizationConfig,
	templateName: string
): void {
	const dataStr = JSON.stringify(customization, null, 2);
	const dataBlob = new Blob([dataStr], { type: 'application/json' });
	const url = URL.createObjectURL(dataBlob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `${templateName}-customization.json`;
	link.click();
	URL.revokeObjectURL(url);
}

/**
 * Handles drag and drop reordering of sections
 */
export class SectionReorderManager {
	private draggedIndex = -1;
	private dragOverIndex = -1;
	private onUpdateCallback: (newOrder: string[]) => void;
	private onAnnounceCallback: (message: string) => void;

	constructor(
		onUpdate: (newOrder: string[]) => void,
		onAnnounce: (message: string) => void
	) {
		this.onUpdateCallback = onUpdate;
		this.onAnnounceCallback = onAnnounce;
	}

	/**
	 * Handles the start of a drag operation
	 */
	handleDragStart(event: DragEvent, index: number, sectionOrder: string[]): void {
		this.draggedIndex = index;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
		}
		const sectionName = SECTION_LABELS[sectionOrder[index]] || sectionOrder[index];
		this.onAnnounceCallback(`Started dragging ${sectionName} section`);
	}

	/**
	 * Handles drag over events
	 */
	handleDragOver(event: DragEvent, index: number): void {
		event.preventDefault();
		this.dragOverIndex = index;
	}

	/**
	 * Handles drag leave events
	 */
	handleDragLeave(): void {
		this.dragOverIndex = -1;
	}

	/**
	 * Handles the drop operation
	 */
	handleDrop(event: DragEvent, dropIndex: number, sectionOrder: string[]): void {
		event.preventDefault();
		if (this.draggedIndex !== -1 && this.draggedIndex !== dropIndex) {
			const newOrder = [...sectionOrder];
			const draggedItem = newOrder.splice(this.draggedIndex, 1)[0];
			newOrder.splice(dropIndex, 0, draggedItem);
			this.onUpdateCallback(newOrder);
			
			const sectionName = SECTION_LABELS[draggedItem] || draggedItem;
			this.onAnnounceCallback(`${sectionName} section moved to position ${dropIndex + 1}`);
		}
		this.resetDragState();
	}

	/**
	 * Handles the end of a drag operation
	 */
	handleDragEnd(): void {
		this.resetDragState();
	}

	/**
	 * Resets the drag state
	 */
	private resetDragState(): void {
		this.draggedIndex = -1;
		this.dragOverIndex = -1;
	}

	/**
	 * Gets the current drag state
	 */
	getDragState(): { draggedIndex: number; dragOverIndex: number } {
		return {
			draggedIndex: this.draggedIndex,
			dragOverIndex: this.dragOverIndex
		};
	}
}

/**
 * Keyboard navigation handler for accessibility
 */
export function handleKeyboardNavigation(event: KeyboardEvent): void {
	switch (event.key) {
		case 'Escape':
			// Close any open modals or return to previous state
			break;
		case 'Tab':
			// Handle tab navigation - browser handles this by default
			break;
		case 'Enter':
		case ' ':
			// Activate focused element
			if (event.target instanceof HTMLElement && event.target.click) {
				event.preventDefault();
				event.target.click();
			}
			break;
	}
}

/**
 * Formats a customization key for display
 */
export function formatCustomizationKey(key: string): string {
	return key
		.replace(/([A-Z])/g, ' $1')
		.replace(/^./, str => str.toUpperCase())
		.trim();
}

/**
 * Validates if a color value is valid
 */
export function isValidColor(color: string): boolean {
	const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
	return colorRegex.test(color);
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}