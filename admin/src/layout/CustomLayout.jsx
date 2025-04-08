// src/layout/CustomLayout.jsx
import { Layout } from 'react-admin';
import CustomAppBar from './CustomAppBar';
import CustomSidebar from './CustomSidebar';
import CustomFooter from './CustomFooter';

const CustomLayout = (props) => (
  <Layout
    {...props}
    appBar={CustomAppBar}
    sidebar={CustomSidebar}
    footer={CustomFooter}
  />
);

export default CustomLayout;
