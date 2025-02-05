'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { QuotationData } from '@/types/quotation'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DBA463',
  },
  tableContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    height: 24,
    fontStyle: 'bold',
  },
  tableColHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCol: {
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    paddingLeft: 5,
  },
  tableCellHeader: {
    fontWeight: 'bold',
  },
  tableCell: {
    paddingLeft: 5,
    paddingRight: 5,
  },
  totalAmount: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  signature: {
    marginTop: 50,
  }
})

interface QuotationPDFProps {
  data: QuotationData
}

const QuotationPDF = ({ data }: QuotationPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.companyName}>{data.companyDetails.name}</Text>
        <Text>{data.companyDetails.address}</Text>
        <Text>{data.companyDetails.poBox}</Text>
        <Text>{data.companyDetails.contact}</Text>
      </View>

      <View>
        <Text>Date: {data.date}</Text>
      </View>

      <View style={{ marginVertical: 10 }}>
        <Text style={{ 
          textDecoration: 'underline', 
          textTransform: 'uppercase',
          textDecorationColor: '#DBA463'
        }}>
          RE: {data.projectTitle}
        </Text>
      </View>

      <View style={styles.tableContainer}>
        <View style={[styles.tableRow, styles.tableColHeader]}>
          <View style={[styles.tableCol, { width: '30%' }]}>
            <Text style={styles.tableCellHeader}>TASK</Text>
          </View>
          <View style={[styles.tableCol, { width: '20%' }]}>
            <Text style={styles.tableCellHeader}>PROFESSIONAL</Text>
          </View>
          <View style={[styles.tableCol, { width: '30%' }]}>
            <Text style={styles.tableCellHeader}>FEE BREAKDOWN</Text>
          </View>
          <View style={[styles.tableCol, { width: '20%' }]}>
            <Text style={styles.tableCellHeader}>DURATION</Text>
          </View>
        </View>

        {data.tasks.map((task, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text style={styles.tableCell}>{task.task}</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}>{task.professional}</Text>
            </View>
            <View style={[styles.tableCol, { width: '30%' }]}>
              {task.feeBreakdown.map((fee, feeIndex) => (
                <View key={feeIndex}>
                  <Text style={styles.tableCell}>{fee.description}</Text>
                  <Text style={styles.tableCell}>KSH {fee.amount}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}>{task.feeBreakdown[0]?.duration}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.totalAmount}>
        <Text>TOTAL AMOUNT: KSH {data.totalAmount}</Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: 'bold' }}>NB/</Text>
        {data.notes.map((note, index) => (
          <Text key={index}>{note}</Text>
        ))}
      </View>

      <View style={styles.signature}>
        <Text>Yours Sincerely,</Text>
        <Text style={{ fontWeight: 'bold' }}>Arch.N.K. KIMATHI</Text>
        <Text>Director Mwonto consultants & construction logistics.</Text>
      </View>
    </Page>
  </Document>
)

export default QuotationPDF 