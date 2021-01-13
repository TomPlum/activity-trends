import React, { Component } from "react";
import { Container } from "react-bootstrap";

interface ErrorBoundaryState {
  hasError: boolean;
  message: String;
}

class ErrorBoundary extends Component<{}, ErrorBoundaryState> {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      message: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true, message: error});
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container>
          <h1>It do be broken.</h1>
          <h2>{this.state.message}</h2>
        </Container>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;