var config = {
    port: process.env.PORT || 3000,

    mongo: {
        uri: 'promopay:password@localhost:27017/promopay',
    }
};

module.exports = config;
