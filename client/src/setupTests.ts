jest.mock('socket.io-client', () => {
  return {
    io: jest.fn()
  };
});