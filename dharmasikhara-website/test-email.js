const net = require('net');
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testPort587() {
    const host = 'mail.infernomach.in';
    const port = 587;
    
    console.log('=== Testing Port 587 (TLS) ===\n');
    
    // Step 1: TCP Connection test
    console.log(`Testing TCP connection to ${host}:${port}...`);
    try {
        await testTcpConnection(host, port);
        console.log('✓ TCP connection successful\n');
    } catch (err) {
        console.log('✗ TCP connection failed:', err.message);
        console.log('Port 587 is also blocked. Using Gmail instead.\n');
        return;
    }
    
    // Step 2: SMTP Auth test
    console.log('Testing SMTP authentication...');
    try {
        const config = {
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            connectionTimeout: 10000,
            socketTimeout: 10000
        };
        
        const transporter = nodemailer.createTransport(config);
        await transporter.verify();
        
        console.log('✓ SMTP authentication successful!');
        console.log('\n✓ Port 587 is working! Your email is ready to send.');
        
    } catch (error) {
        console.log('✗ SMTP authentication failed');
        console.log('Error:', error.message);
    }
}

function testTcpConnection(host, port) {
    return new Promise((resolve, reject) => {
        const socket = net.createConnection({ host, port, timeout: 5000 });
        
        socket.on('connect', () => {
            socket.destroy();
            resolve();
        });
        
        socket.on('timeout', () => {
            socket.destroy();
            reject(new Error('Connection timeout'));
        });
        
        socket.on('error', (err) => {
            reject(err);
        });
    });
}

testPort587();