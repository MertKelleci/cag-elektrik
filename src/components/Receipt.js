import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styleSheet = StyleSheet.create({
  page: {},
});

const Receipt = () => {
  return (
    <Document>
      <Page size="A4" style={styleSheet.page}></Page>
    </Document>
  );
};

export default Receipt;
