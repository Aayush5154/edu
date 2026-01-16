const API_BASE_URL = '/api'

class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        }

        const token = localStorage.getItem('access_token')
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        return headers
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`

        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        }

        try {
            const response = await fetch(url, config)

            // Handle 401 - try to refresh token
            if (response.status === 401) {
                const refreshed = await this.refreshToken()
                if (refreshed) {
                    config.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`
                    const retryResponse = await fetch(url, config)
                    return this.handleResponse(retryResponse)
                } else {
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    window.location.href = '/login'
                    throw new Error('Session expired')
                }
            }

            return this.handleResponse(response)
        } catch (error) {
            throw error
        }
    }

    async handleResponse(response) {
        const data = await response.json().catch(() => null)

        if (!response.ok) {
            const error = new Error(data?.error || data?.detail || 'Request failed')
            error.status = response.status
            error.data = data
            throw error
        }

        return { data, status: response.status }
    }

    async refreshToken() {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) return false

        try {
            const response = await fetch(`${this.baseUrl}/auth/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
            })

            if (response.ok) {
                const data = await response.json()
                localStorage.setItem('access_token', data.access)
                return true
            }
            return false
        } catch {
            return false
        }
    }

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' })
    }

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        })
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' })
    }
}

const api = new ApiService()
export default api
