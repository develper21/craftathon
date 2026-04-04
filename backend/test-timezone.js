/**
 * Timezone Conversion Diagnostic Test
 * Run with: node test-timezone.js
 */

const { applyTimeToDate } = require('./src/utils/scheduleHelper');

console.log('=== TIMEZONE CONVERSION TEST ===\n');

// Test cases with expected results
const testCases = [
    {
        name: 'India (UTC+5:30) - Morning dose',
        timezone: 'Asia/Kolkata',
        localTime: '08:38',
        expectedUTC: '03:08'
    },
    {
        name: 'India (UTC+5:30) - Afternoon dose',
        timezone: 'Asia/Kolkata',
        localTime: '14:00',
        expectedUTC: '08:30'
    },
    {
        name: 'UTC (no offset)',
        timezone: 'UTC',
        localTime: '08:38',
        expectedUTC: '08:38'
    },
    {
        name: 'US Eastern (UTC-5) - Winter',
        timezone: 'America/New_York',
        localTime: '08:38',
        expectedUTC: '13:38'
    },
    {
        name: 'UK (UTC+0)',
        timezone: 'Europe/London',
        localTime: '08:38',
        expectedUTC: '08:38'
    },
];

const testDate = new Date(Date.UTC(2024, 0, 15, 0, 0, 0)); // Jan 15, 2024 00:00 UTC

testCases.forEach(test => {
    const result = applyTimeToDate(testDate, test.localTime, test.timezone);
    const resultTime = result.toISOString().substring(11, 16); // Extract HH:MM from ISO string
    const passed = resultTime === test.expectedUTC;
    
    console.log(`TEST: ${test.name}`);
    console.log(`  Local Time:   ${test.localTime} (${test.timezone})`);
    console.log(`  Expected UTC: ${test.expectedUTC}`);
    console.log(`  Actual UTC:   ${resultTime}`);
    console.log(`  Status:       ${passed ? '✓ PASS' : '✗ FAIL'}`);
    console.log('');
});

console.log('=== END DIAGNOSTIC TEST ===');
console.log('If all tests pass, timezone conversion is working correctly.');
console.log('If tests fail, the offset calculation needs to be fixed.');
