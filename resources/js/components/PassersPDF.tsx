// PassersPDF.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from '@react-pdf/renderer';

// Optional: register a font if needed
// Font.register({ family: 'Helvetica', src: 'path-to-font.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1px solid black',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  cell: {
    flex: 1,
  },
});

const PassersPDF = ({ passers, tab }: { passers: any[]; tab: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{tab} Passers List</Text>

      <View style={styles.tableHeader}>
        <Text style={styles.cell}>Name</Text>
        
      </View>

      {passers.map((passer, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.cell}>
            {passer.last_name}, {passer.first_name} {passer.middle_name}
          </Text>
          
        </View>
      ))}
    </Page>
  </Document>
);

export default PassersPDF;
