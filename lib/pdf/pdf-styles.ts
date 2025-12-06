import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: "bold",
  },
  subheader: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "bold",
    marginTop: 12,
  },
  text: {
    fontSize: 10,
    marginBottom: 4,
  },
  textSmall: {
    fontSize: 8,
    color: "#6b7280",
  },
  table: {
    width: "100%",
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    borderBottomStyle: "solid",
    paddingVertical: 6,
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#9ca3af",
    borderBottomStyle: "solid",
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    paddingHorizontal: 4,
  },
  tableCellSmall: {
    fontSize: 8,
    paddingHorizontal: 2,
  },
  metricCard: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    padding: 10,
    marginBottom: 8,
    borderRadius: 4,
  },

  metricTitle: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  anomalyAlert: {
    backgroundColor: "#fef3c7",
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#fbbf24",
  },

  anomalyAlertText: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#6b7280",
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  metricGridItem: {
    width: "48%",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    padding: 8,
    borderRadius: 4,
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    marginVertical: 12,
  },
});