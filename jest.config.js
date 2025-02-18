module.exports = {
 preset: 'ts-jest', 
 testEnvironment: 'node', 
 moduleFileExtensions: ['ts', 'js'], 
 rootDir: "./",
 testMatch: ['**/*.spec.ts'], 
 transform: {
  '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
 },
};
