const fs = require('fs');
const path = require('path');

// Path to the admin service file
const adminServicePath = path.join(__dirname, 'src', 'admin', 'admin.service.ts');

// Read the file content
let content = fs.readFileSync(adminServicePath, 'utf8');

// Replace all instances of verificationStatus in where clauses
content = content.replace(
  /eq\(tutorSchema\.tutors\.verificationStatus,\s*['"]pending['"]\)/g,
  'eq(tutorSchema.tutors.isVerified, false)'
);

// Replace verificationStatus in set clauses
content = content.replace(
  /verificationStatus:\s*['"]approved['"]/g,
  '// Using isVerified for status\nisVerified: true'
);

content = content.replace(
  /verificationStatus:\s*['"]rejected['"]/g,
  '// Using isVerified for status\nisVerified: false'
);

// Fix references to verificationStatus in return objects
content = content.replace(
  /verificationStatus:\s*updatedTutor\.verificationStatus/g,
  '// Using isVerified as status indicator\nisVerifiedStatus: updatedTutor.isVerified ? "approved" : "pending"'
);

// Write the modified content back to file
fs.writeFileSync(adminServicePath, content, 'utf8');

console.log('Successfully updated references to verificationStatus in admin.service.ts');
