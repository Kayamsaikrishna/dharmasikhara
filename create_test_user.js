const jwt = require('jsonwebtoken');
const fs = require('fs');

// Create a test user and token for development/testing
function createTestUser() {
    // Test user data
    const testUser = {
        userId: 'test-user-id-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'client',
        firstName: 'Test',
        lastName: 'User',
        institution: 'Test Law School',
        year: '3rd Year',
        specialization: 'Criminal Law'
    };
    
    // Create a JWT token (using the same secret as the backend)
    const token = jwt.sign(
        testUser,
        'dharmasikhara_secret', // Same secret used in backend
        { expiresIn: '24h' }
    );
    
    // Save to localStorage format for frontend
    const localStorageData = {
        token: token,
        user: testUser
    };
    
    console.log('Test User Created:');
    console.log('==================');
    console.log('User ID:', testUser.userId);
    console.log('Username:', testUser.username);
    console.log('Email:', testUser.email);
    console.log('Role:', testUser.role);
    console.log('\nToken (for Authorization header):');
    console.log(token);
    console.log('\nTo use in frontend testing, add this to localStorage:');
    console.log('localStorage.setItem("token", "' + token + '");');
    console.log('localStorage.setItem("user", ' + JSON.stringify(JSON.stringify(testUser)) + ');');
    
    // Also save to a file for easy access
    fs.writeFileSync('test_user.json', JSON.stringify(localStorageData, null, 2));
    console.log('\nTest user data saved to test_user.json');
    
    return { token, user: testUser };
}

createTestUser();