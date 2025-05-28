// ADLIOT Codec Implementation
class ADLIOTCodec {
    static encode(content) {
        const header = "ADLIOT_V1.0\n";
        const encrypted = this.encrypt(content);
        const checksum = this.generateChecksum(content);
        return header + encrypted + "\n" + checksum;
    }
    
    static decode(fileContent) {
        const lines = fileContent.split('\n');
        if (lines[0] !== "ADLIOT_V1.0") {
            throw new Error("Invalid ADLIOT file format");
        }
        
        const encrypted = lines[1];
        const checksum = lines[2];
        const decrypted = this.decrypt(encrypted);
        
        if (this.generateChecksum(decrypted) !== checksum) {
            throw new Error("File integrity check failed");
        }
        
        return decrypted;
    }
    
    static encrypt(text) {
        let encrypted = '';
        for (let i = 0; i < text.length; i++) {
            encrypted += String.fromCharCode(text.charCodeAt(i) + (i % 10) + 5);
        }
        return btoa(encrypted);
    }
    
    static decrypt(encrypted) {
        const decoded = atob(encrypted);
        let decrypted = '';
        for (let i = 0; i < decoded.length; i++) {
            decrypted += String.fromCharCode(decoded.charCodeAt(i) - (i % 10) - 5);
        }
        return decrypted;
    }
    
    static generateChecksum(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
}

// UI Functions
function showTab(tabName) {
    // Hide all tab contents
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

function createFile() {
    const content = document.getElementById('contentInput').value;
    const resultDiv = document.getElementById('createResult');
    
    if (!content.trim()) {
        resultDiv.innerHTML = '<div class="error">Please enter some content to create a file.</div>';
        return;
    }
    
    try {
        const encoded = ADLIOTCodec.encode(content);
        
        // Create and download file
        const blob = new Blob([encoded], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'file.adliot';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        resultDiv.innerHTML = '<div class="success">ADLIOT file created and downloaded successfully!</div>';
    } catch (error) {
        resultDiv.innerHTML = `<div class="error">Error creating file: ${error.message}</div>`;
    }
}

function openFile() {
    const fileInput = document.getElementById('fileInput');
    const resultDiv = document.getElementById('openResult');
    const decodedTextarea = document.getElementById('decodedContent');
    
    if (!fileInput.files.length) {
        resultDiv.innerHTML = '<div class="error">Please select a file to open.</div>';
        return;
    }
    
    const file = fileInput.files[0];
    
    if (!file.name.endsWith('.adliot')) {
        resultDiv.innerHTML = '<div class="error">Please select a valid .adliot file.</div>';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const decoded = ADLIOTCodec.decode(e.target.result);
            decodedTextarea.value = decoded;
            resultDiv.innerHTML = '<div class="success">File opened and decoded successfully!</div>';
        } catch (error) {
            resultDiv.innerHTML = `<div class="error">Error opening file: ${error.message}</div>';
            decodedTextarea.value = '';
        }
    };
    
    reader.onerror = function() {
        resultDiv.innerHTML = '<div class="error">Error reading file.</div>';
    };
    
    reader.readAsText(file);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('ADLIOT File Format Tool loaded successfully');
});
