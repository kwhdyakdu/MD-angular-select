import Head from 'next/head'
import { Container } from 'react-bootstrap'

// global styles
import 'bootstrap/dist/css/bootstrap.min.css'

type BaseLayoutProps = {
  title: string
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ title, children }) => (
  <Container as="main">
    <Head>
      <link rel="icon" href="/favicon.png" />
      <title>

        {title}
        
        {' · ModaMatch'}
      </title>
    </Head>

    {children}
  </Container>
)

export default BaseLayout
