module.exports = {
 preset: 'ts-jest', 
 testEnvironment: 'node', 
 moduleFileExtensions: ['ts', 'js'], 
 testMatch: ['**/tests/**/*.test.ts'], 
 transform: {
  '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
 },
 globals: {
   'ts-jest': {
     isolatedModules: true, 
   },
 },
 setupFilesAfterEnv: ['./src/tests/setup.ts'], 
};