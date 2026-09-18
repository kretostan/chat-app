import Container from "./Container";
import Title from "./Title";
import Wrapper from "./Wrapper";

const Navigation = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Wrapper>
      <Container>
        <Title />
        {children}
      </Container>
    </Wrapper>
  );
};

export default Navigation;
