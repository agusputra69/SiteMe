import { toasts } from './stores/toast';
import { goto } from '$app/navigation';

export interface ErrorContext {
	component?: string;
	action?: string;
	userMessage?: string;
	showToast?: boolean;
	redirectTo?: string;
	logLevel?: 'error' | 'warn' | 'info';
	retryable?: boolean;
	metadata?: Record<string, any>;
}

export interface ErrorDetails {
	message: string;
	stack?: string;
	code?: string | number;
	originalError?: any;
	timestamp: string;
	context: ErrorContext;
}

class ErrorHandler {
	private errorLog: ErrorDetails[] = [];
	private maxLogSize = 100;

	/**
	 * Handle errors with proper user feedback and logging
	 */
	handle(error: any, context: ErrorContext = {}): ErrorDetails {
		const errorDetails: ErrorDetails = {
			message: this.extractErrorMessage(error),
			stack: error?.stack,
			code: error?.code || error?.status,
			originalError: error,
			timestamp: new Date().toISOString(),
			context
		};

		// Log error for debugging
		this.logError(errorDetails);

		// Show user-friendly message
		if (context.showToast !== false) {
			this.showUserMessage(errorDetails);
		}

		// Handle redirects
		if (context.redirectTo) {
			requestAnimationFrame(() => {
				setTimeout(() => goto(context.redirectTo!), 1000);
			});
		}

		return errorDetails;
	}

	/**
	 * Handle authentication errors specifically
	 */
	handleAuthError(error: any, context: Omit<ErrorContext, 'redirectTo'> = {}): ErrorDetails {
		return this.handle(error, {
			...context,
			userMessage: 'Authentication failed. Please log in again.',
			redirectTo: '/login',
			component: context.component || 'Auth'
		});
	}

	/**
	 * Handle network/API errors
	 */
	handleNetworkError(error: any, context: ErrorContext = {}): ErrorDetails {
		const isTimeout = error?.message?.includes('timeout') || error?.code === 'TIMEOUT';
		const isConnectionError = error?.message?.includes('network') || error?.code === 'NETWORK_ERROR';
		
		let userMessage = context.userMessage;
		if (!userMessage) {
			if (isTimeout) {
				userMessage = 'Request timed out. Please try again.';
			} else if (isConnectionError) {
				userMessage = 'Network error. Please check your connection.';
			} else {
				userMessage = 'Something went wrong. Please try again.';
			}
		}

		return this.handle(error, {
			...context,
			userMessage,
			retryable: true
		});
	}

	/**
	 * Handle validation errors
	 */
	handleValidationError(error: any, context: ErrorContext = {}): ErrorDetails {
		return this.handle(error, {
			...context,
			userMessage: context.userMessage || 'Please check your input and try again.',
			logLevel: 'warn'
		});
	}

	/**
	 * Handle file processing errors
	 */
	handleFileError(error: any, context: ErrorContext = {}): ErrorDetails {
		const isFileTooLarge = error?.message?.includes('size') || error?.code === 'FILE_TOO_LARGE';
		const isInvalidFormat = error?.message?.includes('format') || error?.code === 'INVALID_FORMAT';
		
		let userMessage = context.userMessage;
		if (!userMessage) {
			if (isFileTooLarge) {
				userMessage = 'File is too large. Please choose a smaller file.';
			} else if (isInvalidFormat) {
				userMessage = 'Invalid file format. Please choose a valid PDF file.';
			} else {
				userMessage = 'Failed to process file. Please try again.';
			}
		}

		return this.handle(error, {
			...context,
			userMessage,
			retryable: true
		});
	}

	/**
	 * Handle database errors
	 */
	handleDbError(error: any, context: ErrorContext = {}): ErrorDetails {
		const isConnectionError = error?.message?.includes('connection') || error?.code === 'CONNECTION_ERROR';
		const isTimeoutError = error?.message?.includes('timeout') || error?.code === 'TIMEOUT';
		
		let userMessage = context.userMessage;
		if (!userMessage) {
			if (isConnectionError) {
				userMessage = 'Database connection error. Please try again.';
			} else if (isTimeoutError) {
				userMessage = 'Operation timed out. Please try again.';
			} else {
				userMessage = 'Failed to save data. Please try again.';
			}
		}

		return this.handle(error, {
			...context,
			userMessage,
			retryable: true
		});
	}

	/**
	 * Extract meaningful error message from various error types
	 */
	private extractErrorMessage(error: any): string {
		if (typeof error === 'string') return error;
		if (error?.message) return error.message;
		if (error?.error?.message) return error.error.message;
		if (error?.details) return error.details;
		return 'An unknown error occurred';
	}

	/**
	 * Log error for debugging purposes
	 */
	private logError(errorDetails: ErrorDetails): void {
		const logLevel = errorDetails.context.logLevel || 'error';
		const logMessage = `[${errorDetails.context.component || 'Unknown'}] ${errorDetails.message}`;
		
		// Console logging for development
		if (import.meta.env.DEV) {
			switch (logLevel) {
				case 'error':
					console.error(logMessage, {
						error: errorDetails.originalError,
						context: errorDetails.context,
						stack: errorDetails.stack
					});
					break;
				case 'warn':
					console.warn(logMessage, errorDetails.context);
					break;
				case 'info':
					console.info(logMessage, errorDetails.context);
					break;
			}
		}

		// Store in memory for debugging
		this.errorLog.push(errorDetails);
		if (this.errorLog.length > this.maxLogSize) {
			this.errorLog.shift();
		}
	}

	/**
	 * Show user-friendly error message
	 */
	private showUserMessage(errorDetails: ErrorDetails): void {
		const message = errorDetails.context.userMessage || errorDetails.message;
		const logLevel = errorDetails.context.logLevel || 'error';

		switch (logLevel) {
			case 'error':
				toasts.error(message);
				break;
			case 'warn':
				toasts.warning(message);
				break;
			case 'info':
				toasts.info(message);
				break;
		}
	}

	/**
	 * Get recent error logs for debugging
	 */
	getErrorLogs(): ErrorDetails[] {
		return [...this.errorLog];
	}

	/**
	 * Clear error logs
	 */
	clearLogs(): void {
		this.errorLog = [];
	}

	/**
	 * Create a retry function for retryable errors
	 */
	createRetryHandler(originalFunction: Function, maxRetries = 3, delay = 1000) {
		return async (...args: any[]) => {
			let lastError: any;
			
			for (let attempt = 1; attempt <= maxRetries; attempt++) {
				try {
					return await originalFunction(...args);
				} catch (error) {
					lastError = error;
					
                                        if (attempt < maxRetries) {
                                                await new Promise((resolve) => setTimeout(resolve, delay * attempt));
                                        }
				}
			}
			
			throw lastError;
		};
	}
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Convenience functions for common error types
export const handleError = (error: any, context?: ErrorContext) => errorHandler.handle(error, context);
export const handleAuthError = (error: any, context?: Omit<ErrorContext, 'redirectTo'>) => errorHandler.handleAuthError(error, context);
export const handleNetworkError = (error: any, context?: ErrorContext) => errorHandler.handleNetworkError(error, context);
export const handleValidationError = (error: any, context?: ErrorContext) => errorHandler.handleValidationError(error, context);
export const handleFileError = (error: any, context?: ErrorContext) => errorHandler.handleFileError(error, context);
export const handleDbError = (error: any, context?: ErrorContext) => errorHandler.handleDbError(error, context);