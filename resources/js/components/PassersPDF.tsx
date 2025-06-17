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

// const styles = StyleSheet.create({
//   page: {
//     padding: 30,
//     fontSize: 10,
//   },
//   title: {
//     fontSize: 16,
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     borderBottom: '1px solid black',
//     marginBottom: 5,
//     fontWeight: 'bold',
//   },
//   row: {
//     flexDirection: 'row',
//     marginBottom: 2,
//   },
//   cell: {
//     flex: 1,
//   },
// });



// const PassersPDF = ({ passers, tab }: { passers: any[]; tab: string }) => (
//   <Document>
//     <Page size="A4" style={styles.page}>
//       <Text style={styles.title}>{tab} Passers List</Text>

//       <View style={styles.tableHeader}>
//         <Text style={styles.cell}>Name</Text>

//       </View>

//       {passers.map((passer, i) => (
//         <View key={i} style={styles.row}>
//           <Text style={styles.cell}>
//             {passer.last_name}, {passer.first_name} {passer.middle_name}
//           </Text>

//         </View>
//       ))}
//     </Page>
//   </Document>
// );


const styles = StyleSheet.create({
  page: {
    padding: 24,
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  rowPair: {
    flexDirection: 'row',
    fontSize: 10,
    marginBottom: 2,
  },
  column: {
    flex: 1,
    flexDirection: 'row',
  },
  numberCell: {
    width: '12%',
  },
  nameCell: {
    width: '88%',
  },
});

// Utility to chunk array into pieces of size n
const chunk = (arr: any[], size: number) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const PassersPDF = ({
  passers,
  tab,
  rowsPerColumn = 70, // default estimated rows per column
}: {
  passers: any[];
  tab: string;
  rowsPerColumn?: number;
}) => {
  const rowsPerPage = rowsPerColumn * 2; // two columns per page
  const pages = chunk(passers, rowsPerPage);

  return (
    <Document>
      {pages.map((pagePassers, pageIndex) => {
        const leftColumn = pagePassers.slice(0, rowsPerColumn);
        const rightColumn = pagePassers.slice(rowsPerColumn, rowsPerPage);

        return (
          <Page key={pageIndex} size="LEGAL" style={styles.page}>
            <Text style={styles.title}>{tab} Passers List</Text>

            {/* Render pairs of rows side-by-side */}
            {Array.from({ length: rowsPerColumn }).map((_, rowIndex) => {
              const leftPasser = leftColumn[rowIndex];
              const rightPasser = rightColumn[rowIndex];
              const leftNumber = pageIndex * rowsPerPage + rowIndex + 1;
              const rightNumber = pageIndex * rowsPerPage + rowIndex + 1 + rowsPerColumn;

              return (
                <View key={rowIndex} style={styles.rowPair}>
                  {/* Left column */}
                  {leftPasser ? (
                    <View style={styles.column}>
                      <Text style={styles.numberCell}>{leftNumber}</Text>
                      <Text style={styles.nameCell}>
                        {leftPasser.last_name}, {leftPasser.first_name} {leftPasser.middle_name}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.column}></View>
                  )}

                  {/* Right column */}
                  {rightPasser ? (
                    <View style={styles.column}>
                      <Text style={styles.numberCell}>{rightNumber}</Text>
                      <Text style={styles.nameCell}>
                        {rightPasser.last_name}, {rightPasser.first_name} {rightPasser.middle_name}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </Page>
        );
      })}
    </Document>
  );
};


export default PassersPDF;
