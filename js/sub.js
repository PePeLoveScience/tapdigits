// State management
let state = {
    currentStep: 1,
    selectedApp: '',
    selectedCountry: '',
    selectedCountryCode: '',
    reservedNumber: '',
    reservationTime: 180, // 3 minutes in seconds
    verificationTime: 600, // 10 minutes for verification
    allCountries: []
};

let verificationTimerInterval = null;

// Fetch all countries from REST Countries API
async function loadCountries() {
    try {
        // Specify only the fields we need
        const fields = 'name,cca2,flag,idd';
        const response = await fetch(`https://restcountries.com/v3.1/all?fields=${fields}`);
        const countries = await response.json();

        // Sort countries by name
        state.allCountries = countries
            .map(country => ({
                name: country.name.common,
                code: country.cca2,
                flag: country.flag || '🌍',
                callingCode: country.idd?.root ?
                    (country.idd.root + (country.idd.suffixes?.[0] || '')) : '+1'
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        populateCountrySelect(state.allCountries);
    } catch (error) {
        console.error('Error loading countries:', error);
        // Fallback to basic list if API fails
        state.allCountries = [
            { name: 'United States', code: 'US', flag: '🇺🇸', callingCode: '+1' },
            { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', callingCode: '+44' },
            { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', callingCode: '+971' }
        ];
        populateCountrySelect(state.allCountries);
    }
}

// Populate country select dropdown
function populateCountrySelect(countries) {
    const select = document.getElementById('countrySelect');
    select.innerHTML = '<option value="">Select a country...</option>';

    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = `${country.flag} ${country.name} (${country.callingCode})`;
        option.dataset.code = country.callingCode;
        option.dataset.name = country.name;
        select.appendChild(option);
    });
}

// Search countries
document.addEventListener('DOMContentLoaded', () => {
    loadCountries();

    const searchInput = document.getElementById('countrySearch');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = state.allCountries.filter(country =>
            country.name.toLowerCase().includes(searchTerm) ||
            country.callingCode.includes(searchTerm)
        );
        populateCountrySelect(filtered);
    });
});

// Progress tracking
function updateProgress(step) {
    const progress = (step / 7) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = `Step ${step} of 7`;
}

// Show specific step
function showStep(stepNumber) {
    // Hide all steps
    for (let i = 1; i <= 7; i++) {
        document.getElementById(`step${i}`).classList.add('hidden');
    }
    // Hide intermediate steps
    document.getElementById('step4_5')?.classList.add('hidden');
    document.getElementById('step4_75')?.classList.add('hidden');

    // Show current step
    const stepId = stepNumber.toString().includes('.') ? `step${stepNumber.toString().replace('.', '_')}` : `step${stepNumber}`;
    document.getElementById(stepId).classList.remove('hidden');
    state.currentStep = stepNumber;

    // Update progress for main steps only
    if (Number.isInteger(stepNumber)) {
        updateProgress(stepNumber);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Generate phone number based on country - MASKED VERSION
function generateMaskedPhoneNumber(countryCode) {
    const patterns = {
        '+971': () => `+971 5${randomDigit()}X XXX XXX`,
        '+1': () => `+1 (${randomDigit()}XX) XXX-XXXX`,
        '+44': () => `+44 7${randomDigit()}XX XXXXXX`,
        '+91': () => `+91 ${randomDigit()}XXXX XXXXX`,
        '+61': () => `+61 4${randomDigit()}X XXX XXX`,
        '+49': () => `+49 1${randomDigit()}X XXXXXXX`,
        '+82': () => `+82 2XX XXX XXX`,
        '+81': () => `+81 ${randomDigit()}X XXXX XXXX`,
        '+86': () => `+86 1${randomDigit()}X XXXX XXXX`,
        '+33': () => `+33 ${randomDigit()} XX XX XX XX`,
    };

    const pattern = patterns[countryCode] || (() => `${countryCode} ${randomDigit()}XX XXX XXX`);
    return pattern();
}

// Generate full phone number (for final reveal)
function generateFullPhoneNumber(countryCode) {
    const patterns = {
        '+971': () => `+971 5${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()}${randomDigit()}`,
        '+1': () => `+1 (${randomDigit()}${randomDigit()}${randomDigit()}) ${randomDigit()}${randomDigit()}${randomDigit()}-${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}`,
        '+44': () => `+44 7${randomDigit()}${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}`,
        '+91': () => `+91 ${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}`,
        '+61': () => `+61 4${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()}${randomDigit()}`,
        '+49': () => `+49 1${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}`,
        '+82': () => `+82 2${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()}${randomDigit()}`,
        '+81': () => `+81 ${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}`,
        '+86': () => `+86 1${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}`,
        '+33': () => `+33 ${randomDigit()} ${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()}`,
    };

    const pattern = patterns[countryCode] || (() => `${countryCode} ${randomDigit()}${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()}${randomDigit()} ${randomDigit()}${randomDigit()}${randomDigit()}`);
    return pattern();
}

function randomDigit() {
    return Math.floor(Math.random() * 10);
}

// Step 1: App Selection
document.querySelectorAll('[data-app]').forEach(button => {
    button.addEventListener('click', function () {
        document.querySelectorAll('[data-app]').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        state.selectedApp = this.dataset.app;
        document.getElementById('continueStep1').disabled = false;
    });
});

document.getElementById('continueStep1').addEventListener('click', () => {
    showStep(2);
});

// Step 2: Country Selection
document.getElementById('countrySelect').addEventListener('change', function () {
    if (this.value) {
        const selectedOption = this.options[this.selectedIndex];
        state.selectedCountry = selectedOption.dataset.name;
        state.selectedCountryCode = selectedOption.dataset.code;
        document.getElementById('continueStep2').disabled = false;
    } else {
        document.getElementById('continueStep2').disabled = true;
    }
});

document.getElementById('continueStep2').addEventListener('click', () => {
    showStep(3);
    runSystemCheck();
});

// Step 3: System Check - SLOWER (90 seconds)
function runSystemCheck() {
    const messages = [
        { text: 'Connecting to number allocation system...', delay: 5000 },
        { text: 'Scanning unused numbers in selected country...', delay: 10000 },
        { text: 'Checking SMS routing compatibility...', delay: 20000 },
        { text: 'Verifying app compatibility...', delay: 35000 },
        { text: 'Reserving number from pool...', delay: 45000 }
    ];

    const container = document.getElementById('loadingMessages');
    const mainText = document.getElementById('loadingMainText');

    messages.forEach((msg, index) => {
        setTimeout(() => {
            mainText.textContent = msg.text;
            const div = document.createElement('div');
            div.className = 'loading-message';
            div.style.animationDelay = '0s';
            div.innerHTML = `
                        <div class="check"></div>
                        <span>${msg.text}</span>
                    `;
            container.appendChild(div);

            if (index === messages.length - 1) {
                setTimeout(() => {
                    state.reservedNumber = generateMaskedPhoneNumber(state.selectedCountryCode);
                    showStep(4);
                    startReservationTimer();
                    populateNumberInfo();
                }, 3000);
            }
        }, msg.delay);
    });
}

// Populate number information
function populateNumberInfo() {
    document.getElementById('reservedNumber').textContent = state.reservedNumber;
    document.getElementById('selectedApp').textContent = state.selectedApp;
    document.getElementById('selectedCountry').textContent = state.selectedCountry;
}

// Reservation timer
function startReservationTimer() {
    const timerElement = document.getElementById('timerText');

    const interval = setInterval(() => {
        state.reservationTime--;
        const minutes = Math.floor(state.reservationTime / 60);
        const seconds = state.reservationTime % 60;
        timerElement.textContent = `Reserved for ${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (state.reservationTime <= 0) {
            clearInterval(interval);
            timerElement.textContent = 'Reservation expired';
        }
    }, 1000);
}

// Step 4: Continue to unlock
document.getElementById('continueStep4').addEventListener('click', () => {
    showStep(4.5);
    setTimeout(() => {
        showStep(4.75);
    }, 30000); // Show loading for 1 minute
});

// Step 4.75: Continue to verification
document.getElementById('continueStep4_75').addEventListener('click', () => {
    showStep(5);
});

// Step 5: Open verification in new tab
document.getElementById('verifyButton').addEventListener('click', () => {
    window.open('https://unlockofferwall.top/cl/i/37mgmw', '_blank');
    showStep(6);
    startVerificationTimer();
    // NOTE: Step 7 will be triggered by postback - removed automatic unlock
});

// Verification timer (10 minutes)
function startVerificationTimer() {
    const timerElement = document.getElementById('verificationTimer');

    verificationTimerInterval = setInterval(() => {
        state.verificationTime--;
        const minutes = Math.floor(state.verificationTime / 60);
        const seconds = state.verificationTime % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (state.verificationTime <= 0) {
            clearInterval(verificationTimerInterval);
            timerElement.textContent = 'Time expired';
            alert('Verification time expired. Please start over.');
            location.reload();
        }
    }, 1000);
}

// This function will be called by postback
window.unlockNumber = function () {
    if (verificationTimerInterval) {
        clearInterval(verificationTimerInterval);
    }
    showStep(7);
    populateFinalNumber();
};

// Step 7: Show final number
function populateFinalNumber() {
    // Generate final unmasked number
    const finalNumber = generateFullPhoneNumber(state.selectedCountryCode);

    document.getElementById('finalNumber').textContent = finalNumber;
    document.getElementById('finalApp').textContent = state.selectedApp;
    document.getElementById('finalCountry').textContent = state.selectedCountry;
    document.getElementById('instructionApp').textContent = state.selectedApp;
}

// Initialize
updateProgress(1);