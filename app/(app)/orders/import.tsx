import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FileUp, FileText, CheckCircle2, ChevronRight, Save, KeyRound } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useOrderStore } from '@/src/stores/orderStore';
import { pdfService } from '@/src/services/pdfService';
import { Button } from '@/src/components/ui/Button';
import { TextInput } from '@/src/components/ui/TextInput';

export default function ImportOrderScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const s = theme.spacing;
  const router = useRouter();

  const { parseDocument, isParsing, parsedData, importParsedData, clearParsedData } = useOrderStore();
  const [aiKey, setAiKey] = useState('');
  const [partyName, setPartyName] = useState('');
  const [saving, setSaving] = useState(false);

  // Simplified: 
  // 1. Enter Gemini Key (if not in edge function env)
  // 2. Upload Document
  // 3. Review 
  // 4. Save

  const handleUpload = async () => {
    try {
      const doc = await pdfService.pickPdfDocument();
      if (!doc) return;

      await parseDocument(doc.base64, doc.mimeType, aiKey || undefined);
    } catch (err: any) {
      Alert.alert('Processing Failed', err.message);
    }
  };

  const handleSave = async () => {
    if (!partyName) {
      Alert.alert('Details Missing', 'Please enter a Party/Supplier Name for this order.');
      return;
    }
    if (!parsedData || parsedData.length === 0) {
      Alert.alert('No Items', 'No items were parsed from this document.');
      return;
    }

    setSaving(true);
    try {
      await importParsedData(partyName, parsedData);
      Alert.alert('Success', 'Order has been imported and stock updated successfully!');
      router.back();
    } catch (err: any) {
      Alert.alert('Import Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (isParsing) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }]}>
        <FileText size={64} color={c.primary} style={{ opacity: 0.5, marginBottom: s.xl }} />
        <Text style={{ color: c.onBackground, fontSize: 18, fontWeight: '600' }}>Analyzing Document...</Text>
        <Text style={{ color: c.placeholder, marginTop: s.sm, textAlign: 'center', paddingHorizontal: s.xl }}>
          Our AI is reading your document to automatically extract exactly what was ordered.
        </Text>
      </View>
    );
  }

  if (parsedData) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
          <Text style={{ color: c.onSurface, fontSize: 20, fontWeight: '700' }}>Review Import</Text>
          <TouchableOpacity onPress={clearParsedData}>
            <Text style={{ color: c.error }}>Discard</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: s.lg }}>
          <View style={{ marginBottom: s.xl }}>
            <TextInput
              label="Party/Supplier Name *"
              placeholder="e.g. Kajaria Ceramics Ltd."
              value={partyName}
              onChangeText={setPartyName}
            />
          </View>

          <Text style={{ color: c.onBackground, fontSize: 16, fontWeight: '600', marginBottom: s.md }}>
            Extracted Items ({parsedData.length})
          </Text>

          {parsedData.map((item, index) => (
            <View key={index} style={[styles.card, { backgroundColor: c.surface, borderLeftColor: c.primary }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.onSurface, fontWeight: '700', fontSize: 15 }}>{item.design_name || 'Unknown Design'}</Text>
                <Text style={{ color: c.onSurfaceVariant, fontSize: 13, marginTop: 4 }}>
                  {item.category || 'N/A'} • {item.size || 'Size N/A'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: c.primary, fontWeight: '700', fontSize: 16 }}>{item.box_count} Boxes</Text>
                {item.price_per_box ? (
                  <Text style={{ color: c.onSurfaceVariant, fontSize: 12 }}>₹{item.price_per_box}/box</Text>
                ) : null}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: c.surface, borderTopColor: c.border }]}>
          <Button 
            title="Confirm Import & Add Stock" 
            variant="primary"
            onPress={handleSave} 
            loading={saving}
            style={{ marginBottom: 12 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={{ color: c.onSurface, fontSize: 20, fontWeight: '700' }}>Import Order (AI)</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: s.lg }}>
        <Text style={{ color: c.onBackground, fontSize: 15, lineHeight: 22, marginBottom: s.xl }}>
          Upload a PDF performa invoice, bill, or image of an order. The AI will extract all items and automatically restock your inventory.
        </Text>

        <View style={[styles.uploadBox, { backgroundColor: c.surfaceVariant, borderColor: c.border }]}>
          <FileUp size={48} color={c.primary} style={{ marginBottom: s.md }} />
          <Text style={{ color: c.onSurface, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            Select Document or Image
          </Text>
          <Text style={{ color: c.placeholder, fontSize: 13, marginBottom: s.lg, textAlign: 'center' }}>
            Supported: .pdf, .jpg, .png
          </Text>
          <Button title="Browse Files" onPress={handleUpload} variant="outline" />
        </View>

        <View style={{ marginTop: s.xl, padding: s.lg, backgroundColor: c.surfaceVariant + '40', borderRadius: theme.borderRadius.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: s.md }}>
            <KeyRound size={20} color={c.onSurfaceVariant} />
            <Text style={{ color: c.onSurfaceVariant, fontSize: 15, fontWeight: '600', marginLeft: s.sm }}>
              Developer Override (Optional)
            </Text>
          </View>
          <Text style={{ color: c.placeholder, fontSize: 12, marginBottom: s.md }}>
            If your Edge Function does not have the GEMINI_API_KEY secret set, paste your Gemini API key here to process the document.
          </Text>
          <TextInput 
            label="Gemini API Key" 
            placeholder="AIzaSy..." 
            value={aiKey} 
            onChangeText={setAiKey}
            secureTextEntry
          />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1 },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  footer: { padding: 20, paddingBottom: 32, borderTopWidth: 1 }
});
