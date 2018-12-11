const bcrypt = require('bcrypt');

const saltRounds = 10;
const password = process.argv[2];
bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
      console.log('hashed password:', hash)
    });
});
