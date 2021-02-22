import React, { Component } from 'react'
import PageLoadingSpinner from "./PageLoadingSpinner";
import DisabledOverlay from "./DisabledOverlay";
import { Container } from "react-bootstrap";

interface PageProps {
  description?: String;
}

interface PageState {
  loading: boolean;
  data: any;
}

class Page extends Component<PageProps, PageState> {
  render() {
    const { loading, data } = this.state;
    return (
      <Container fluid className={"page-container"}>
        <PageLoadingSpinner active={loading}/>
        <DisabledOverlay active={!loading && !data}/>
        {this.props.children}
      </Container>
    );
  }
}

export default Page;