/**
 * GIAI ĐOẠN 2: LOGIN JAVASCRIPT
 * Chương 4: JavaScript cơ bản, Form validation
 * Chương 5: Events, Form handling
 */

// DOM Elements
const loginElements = {
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginCard: document.querySelector('.login-card'),
    registerLink: document.querySelector('.register-link'),
    backToLoginLink: document.querySelector('.back-to-login'),
    messageOverlay: document.getElementById('messageOverlay'),
    messageContent: document.getElementById('messageContent'),
    closeMessage: document.getElementById('closeMessage')
};

// Form state
const formState = {
    isLoginMode: true,
    isLoading: false,
    formErrors: {}
};

// Validation rules
const validationRules = {
    username: {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/,
        message: 'Tên đăng nhập phải có 3-20 ký tự, chỉ chứa chữ, số và dấu gạch dưới'
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Email không hợp lệ'
    },
    password: {
        required: true,
        minLength: 6,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        message: 'Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số'
    },
    confirmPassword: {
        required: true,
        matchField: 'password',
        message: 'Xác nhận mật khẩu không khớp'
    }
};

/**
 * CHƯƠNG 4: DOM MANIPULATION & EVENTS
 */

// Initialize Login Page
function initLoginPage() {
    console.log('Khởi tạo Login JavaScript...');
    
    setupEventListeners();
    initFormAnimations();
    
    console.log('Login JavaScript sẵn sàng!');
}

// Setup Event Listeners
function setupEventListeners() {
    // Form submissions
    if (loginElements.loginForm) {
        loginElements.loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    if (loginElements.registerForm) {
        loginElements.registerForm.addEventListener('submit', handleRegisterSubmit);
    }
    
    // Form mode switching
    if (loginElements.registerLink) {
        loginElements.registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchToRegister();
        });
    }
    
    if (loginElements.backToLoginLink) {
        loginElements.backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchToLogin();
        });
    }
    
    // Message overlay
    if (loginElements.closeMessage) {
        loginElements.closeMessage.addEventListener('click', hideMessage);
    }
    
    if (loginElements.messageOverlay) {
        loginElements.messageOverlay.addEventListener('click', (e) => {
            if (e.target === loginElements.messageOverlay) {
                hideMessage();
            }
        });
    }
    
    // Real-time validation
    setupRealTimeValidation();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * CHƯƠNG 5: FORM VALIDATION
 */
function setupRealTimeValidation() {
    // Get all form inputs
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
    
    // Special handling for confirm password
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            const passwordInput = document.getElementById('regPassword');
            if (passwordInput.value && confirmPasswordInput.value) {
                validatePasswordMatch(passwordInput, confirmPasswordInput);
            }
        });
    }
}

function validateField(input) {
    const fieldName = input.name;
    const value = input.value.trim();
    const rules = validationRules[fieldName];
    
    if (!rules) return true;
    
    // Clear previous errors
    clearFieldError(input);
    
    // Required validation
    if (rules.required && !value) {
        showFieldError(input, `${getFieldDisplayName(fieldName)} là bắt buộc`);
        return false;
    }
    
    if (!value) return true; // Skip other validations if empty and not required
    
    // Length validation
    if (rules.minLength && value.length < rules.minLength) {
        showFieldError(input, `${getFieldDisplayName(fieldName)} phải có ít nhất ${rules.minLength} ký tự`);
        return false;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
        showFieldError(input, `${getFieldDisplayName(fieldName)} không được vượt quá ${rules.maxLength} ký tự`);
        return false;
    }
    
    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
        showFieldError(input, rules.message);
        return false;
    }
    
    // Match field validation (for confirm password)
    if (rules.matchField) {
        const matchInput = document.querySelector(`[name="${rules.matchField}"]`);
        if (matchInput && matchInput.value !== value) {
            showFieldError(input, rules.message);
            return false;
        }
    }
    
    // Show success state
    input.classList.add('valid');
    return true;
}

function validatePasswordMatch(passwordInput, confirmInput) {
    if (passwordInput.value !== confirmInput.value) {
        showFieldError(confirmInput, 'Xác nhận mật khẩu không khớp');
        return false;
    } else {
        clearFieldError(confirmInput);
        confirmInput.classList.add('valid');
        return true;
    }
}

function showFieldError(input, message) {
    const errorElement = input.parentElement.querySelector('.error-message');
    
    if (errorElement) {
        errorElement.textContent = message;
        input.classList.add('error');
        input.classList.remove('valid');
        
        // Shake animation
        input.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }
    
    formState.formErrors[input.name] = message;
}

function clearFieldError(input) {
    const errorElement = input.parentElement.querySelector('.error-message');
    
    if (errorElement) {
        errorElement.textContent = '';
        input.classList.remove('error');
    }
    
    delete formState.formErrors[input.name];
}

function getFieldDisplayName(fieldName) {
    const names = {
        username: 'Tên đăng nhập',
        email: 'Email', 
        password: 'Mật khẩu',
        confirmPassword: 'Xác nhận mật khẩu'
    };
    return names[fieldName] || fieldName;
}

/**
 * FORM SUBMISSION HANDLERS
 */
function handleLoginSubmit(e) {
    e.preventDefault();
    
    if (formState.isLoading) return;
    
    const formData = new FormData(e.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    console.log('Đăng nhập với:', loginData.username);
    
    // Validate form
    if (!validateLoginForm(loginData)) {
        return;
    }
    
    // Show loading state
    setFormLoading(true);
    
    // Simulate API call
    simulateLogin(loginData)
        .then(response => {
            if (response.success) {
                showMessage('Đăng nhập thành công! Đang chuyển hướng...', 'success');
                setTimeout(() => {
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showMessage(response.message || 'Đăng nhập thất bại', 'error');
            }
        })
        .catch(error => {
            showMessage('Lỗi kết nối. Vui lòng thử lại.', 'error');
            console.error('Login error:', error);
        })
        .finally(() => {
            setFormLoading(false);
        });
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    
    if (formState.isLoading) return;
    
    const formData = new FormData(e.target);
    const registerData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
    };
    
    console.log('Đăng ký với:', registerData.username, registerData.email);
    
    // Validate form
    if (!validateRegisterForm(registerData)) {
        return;
    }
    
    // Show loading state
    setFormLoading(true);
    
    // Simulate API call
    simulateRegister(registerData)
        .then(response => {
            if (response.success) {
                showMessage('Đăng ký thành công! Bạn có thể đăng nhập ngay.', 'success');
                setTimeout(() => {
                    switchToLogin();
                    // Pre-fill username
                    document.getElementById('username').value = registerData.username;
                }, 1500);
            } else {
                showMessage(response.message || 'Đăng ký thất bại', 'error');
            }
        })
        .catch(error => {
            showMessage('Lỗi kết nối. Vui lòng thử lại.', 'error');
            console.error('Register error:', error);
        })
        .finally(() => {
            setFormLoading(false);
        });
}

/**
 * FORM VALIDATION
 */
function validateLoginForm(data) {
    let isValid = true;
    
    // Validate username
    const usernameInput = document.getElementById('username');
    if (!data.username) {
        showFieldError(usernameInput, 'Tên đăng nhập không được để trống');
        isValid = false;
    }
    
    // Validate password
    const passwordInput = document.getElementById('password');
    if (!data.password) {
        showFieldError(passwordInput, 'Mật khẩu không được để trống');
        isValid = false;
    }
    
    return isValid;
}

function validateRegisterForm(data) {
    let isValid = true;
    
    // Validate all fields
    const fields = ['username', 'email', 'password'];
    
    fields.forEach(fieldName => {
        const input = document.getElementById(fieldName === 'password' ? 'regPassword' : 
                                            fieldName === 'username' ? 'regUsername' : fieldName);
        if (input && !validateField(input)) {
            isValid = false;
        }
    });
    
    // Validate password match
    const passwordInput = document.getElementById('regPassword');
    const confirmInput = document.getElementById('confirmPassword');
    if (passwordInput && confirmInput) {
        if (!validatePasswordMatch(passwordInput, confirmInput)) {
            isValid = false;
        }
    }
    
    // Check terms agreement
    const agreeTerms = document.getElementById('agreeTerms');
    if (agreeTerms && !agreeTerms.checked) {
        showMessage('Bạn phải đồng ý với Điều khoản sử dụng', 'error');
        isValid = false;
    }
    
    return isValid;
}

/**
 * FORM MODE SWITCHING
 */
function switchToRegister() {
    console.log('Chuyển sang chế độ đăng ký');
    
    formState.isLoginMode = false;
    
    // Hide login form
    if (loginElements.loginForm) {
        loginElements.loginForm.style.display = 'none';
    }
    
    // Show register form
    if (loginElements.registerForm) {
        loginElements.registerForm.style.display = 'block';
    }
    
    // Clear errors
    clearAllErrors();
    
    // Focus first input
    const firstInput = document.getElementById('regUsername');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 300);
    }
    
    // Update page title
    document.title = 'Đăng ký - Sensor Dashboard';
}

function switchToLogin() {
    console.log('Chuyển sang chế độ đăng nhập');
    
    formState.isLoginMode = true;
    
    // Hide register form
    if (loginElements.registerForm) {
        loginElements.registerForm.style.display = 'none';
    }
    
    // Show login form
    if (loginElements.loginForm) {
        loginElements.loginForm.style.display = 'block';
    }
    
    // Clear errors
    clearAllErrors();
    
    // Focus first input
    const firstInput = document.getElementById('username');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 300);
    }
    
    // Update page title
    document.title = 'Đăng nhập - Sensor Dashboard';
}

/**
 * LOADING STATES
 */
function setFormLoading(loading) {
    formState.isLoading = loading;
    
    const activeForm = formState.isLoginMode ? loginElements.loginForm : loginElements.registerForm;
    const submitButton = activeForm ? activeForm.querySelector('button[type="submit"]') : null;
    const inputs = activeForm ? activeForm.querySelectorAll('.form-input') : [];
    
    if (loading) {
        // Disable form
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('loading');
        }
        
        inputs.forEach(input => {
            input.disabled = true;
        });
        
        if (loginElements.loginCard) {
            loginElements.loginCard.classList.add('loading');
        }
    } else {
        // Enable form
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
        }
        
        inputs.forEach(input => {
            input.disabled = false;
        });
        
        if (loginElements.loginCard) {
            loginElements.loginCard.classList.remove('loading');
        }
    }
}

/**
 * MESSAGE SYSTEM
 */
function showMessage(message, type = 'info') {
    if (!loginElements.messageOverlay || !loginElements.messageContent) return;
    
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    const icons = {
        success: '✅',
        error: '❌', 
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    loginElements.messageContent.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">${icons[type]}</span>
            <span>${message}</span>
        </div>
    `;
    
    loginElements.messageOverlay.classList.add('show');
    loginElements.messageOverlay.querySelector('.message-box').style.borderTop = `4px solid ${colors[type]}`;
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            hideMessage();
        }, 3000);
    }
}

function hideMessage() {
    if (loginElements.messageOverlay) {
        loginElements.messageOverlay.classList.remove('show');
    }
}

/**
 * UTILITY FUNCTIONS
 */
function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    const inputElements = document.querySelectorAll('.form-input');
    
    errorElements.forEach(el => el.textContent = '');
    inputElements.forEach(el => {
        el.classList.remove('error', 'valid');
    });
    
    formState.formErrors = {};
}

function initFormAnimations() {
    // Add entrance animations to form groups
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            group.style.transition = 'all 0.6s ease';
            group.style.opacity = '1';
            group.style.transform = 'translateY(0)';
        }, 100 * index);
    });
}

function handleKeyboardShortcuts(e) {
    // Enter key to switch forms (when not in input)
    if (e.key === 'Enter' && !e.target.matches('input, button')) {
        if (formState.isLoginMode) {
            loginElements.loginForm.querySelector('button[type="submit"]').click();
        } else {
            loginElements.registerForm.querySelector('button[type="submit"]').click();
        }
    }
    
    // Escape to close message
    if (e.key === 'Escape') {
        hideMessage();
    }
}

/**
 * SIMULATION FUNCTIONS (Giai đoạn 4 sẽ thay bằng API thật)
 */
function simulateLogin(loginData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate different scenarios
            if (loginData.username === 'admin' && loginData.password === 'admin123') {
                resolve({ success: true, message: 'Đăng nhập thành công' });
            } else if (loginData.username === 'demo' && loginData.password === 'demo123') {
                resolve({ success: true, message: 'Đăng nhập thành công' });
            } else {
                resolve({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
            }
        }, 1500); // Simulate network delay
    });
}

function simulateRegister(registerData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate username already exists
            if (registerData.username === 'admin' || registerData.username === 'test') {
                resolve({ success: false, message: 'Tên đăng nhập đã tồn tại' });
            } else if (registerData.email === 'test@example.com') {
                resolve({ success: false, message: 'Email đã được sử dụng' });
            } else {
                resolve({ success: true, message: 'Đăng ký thành công' });
            }
        }, 2000); // Simulate network delay
    });
}

/**
 * INITIALIZATION
 * Chờ DOM ready trước khi khởi tạo
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoginPage);
} else {
    initLoginPage();
}
