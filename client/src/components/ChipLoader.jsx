import styled from 'styled-components';

const ChipLoader = ({ fullScreen = false, message = 'Loading...' }) => {
  return (
    <StyledWrapper $fullScreen={fullScreen}>
      <div className="loader-container">
        <section className="loader">
          <div className="slider" style={{ '--i': 0 }}></div>
          <div className="slider" style={{ '--i': 1 }}></div>
          <div className="slider" style={{ '--i': 2 }}></div>
          <div className="slider" style={{ '--i': 3 }}></div>
          <div className="slider" style={{ '--i': 4 }}></div>
        </section>
        {fullScreen && <p className="loader-message">{message}</p>}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  ${props => props.$fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #f0f0f0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  `}

  .loader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }

  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
  }

  .slider {
    overflow: hidden;
    background-color: white;
    margin: 0 15px;
    height: 80px;
    width: 20px;
    border-radius: 30px;
    box-shadow: 15px 15px 20px rgba(0, 0, 0, 0.1), -15px -15px 30px #fff,
      inset -5px -5px 10px rgba(0, 0, 255, 0.1),
      inset 5px 5px 10px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .slider::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 20px;
    width: 20px;
    border-radius: 100%;
    box-shadow: inset 0px 0px 0px rgba(0, 0, 0, 0.3), 0px 420px 0 400px #2697f3,
      inset 0px 0px 0px rgba(0, 0, 0, 0.1);
    animation: animate_2 2.5s ease-in-out infinite;
    animation-delay: calc(-0.5s * var(--i));
  }

  @keyframes animate_2 {
    0% {
      transform: translateY(250px);
      filter: hue-rotate(0deg);
    }
    50% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(250px);
      filter: hue-rotate(180deg);
    }
  }

  .loader-message {
    color: #64748b;
    margin-top: 30px;
    font-size: 18px;
    text-align: center;
  }
`;

export default ChipLoader;
