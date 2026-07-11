import React, { useState } from 'react';
import { ShoppingBag, Calendar, Tag, Edit3, Trash2, ShieldAlert, Sparkles, TrendingDown, ArrowLeft } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { SnackBar } from '../../components/SnackBar';
import { MOCK_MEMORIES } from '../mockData';

export function DetailsScreen() {
  const { selectedItemId, navigateTo } = useNavigation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch target mock item
  const item = MOCK_MEMORIES.find((m) => m.id === selectedItemId) || MOCK_MEMORIES[0];
  const [rawText, setRawText] = useState(item.rawText);

  // Parse display title helper
  const getCleanTitle = () => {
    let cleanText = item.rawText;
    cleanText = cleanText.replace(/#\S+/g, '');
    cleanText = cleanText.replace(/@\S+/g, '');
    cleanText = cleanText.replace(/\$\d+(\.\d{2})?/g, '');
    return cleanText.trim() || 'Untitled Purchase';
  };

  const handleEditSave = () => {
    setIsEditOpen(false);
    setToastMessage('Memory updated successfully');
  };

  const handleDeleteConfirm = () => {
    setIsDeleteOpen(false);
    // Redirect back to timeline
    navigateTo('timeline');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
      {/* Back button and page Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="text-28" style={{ fontWeight: 700 }}>{getCleanTitle()}</h1>
          <p className="text-14" style={{ color: 'var(--text-secondary)' }}>
            Memory Details & History
          </p>
        </div>
      </div>

      {/* Latest logged details header panel */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 'var(--space-16)', alignItems: 'center' }} className="card-panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {item.merchant && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', color: 'var(--text-primary)', fontWeight: 500 }} className="text-16">
              <ShoppingBag size={16} style={{ color: 'var(--text-secondary)' }} />
              {item.merchant}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', color: 'var(--text-secondary)' }} className="text-12">
            <Calendar size={14} />
            Recorded: {formatDate(item.createdAt)}
          </div>
          {item.nextReminderDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', color: 'var(--warning)', fontWeight: 500 }} className="text-12">
              <Sparkles size={14} />
              Renewal: {formatDate(item.nextReminderDate)}
            </div>
          )}
        </div>
        {item.price !== undefined && (
          <div
            className="text-28 font-mono"
            style={{
              fontWeight: 700,
              color: 'var(--primary)',
              textAlign: 'right',
              padding: 'var(--space-8)',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-8)',
              border: '1px solid var(--border)'
            }}
          >
            ${item.price.toFixed(2)}
          </div>
        )}
      </section>

      {/* Quick Action buttons */}
      <section style={{ display: 'flex', gap: 'var(--space-8)' }}>
        <Button variant="secondary" onClick={() => setIsEditOpen(true)} icon={<Edit3 size={16} />} style={{ flexGrow: 1 }}>
          Edit Note
        </Button>
        <Button variant="danger" onClick={() => setIsDeleteOpen(true)} icon={<Trash2 size={16} />} style={{ width: '120px' }}>
          Delete
        </Button>
      </section>

      {/* Dynamic Insights list */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        <h2 className="text-12" style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Insights & Analysis
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)' }}>
          <Card radius="md" style={{ display: 'flex', gap: 'var(--space-8)', backgroundColor: 'transparent' }}>
            <TrendingDown size={18} style={{ color: 'var(--success)' }} />
            <div>
              <span className="text-12" style={{ color: 'var(--text-secondary)' }}>Price stability</span>
              <h4 className="text-16" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Stable</h4>
            </div>
          </Card>
          <Card radius="md" style={{ display: 'flex', gap: 'var(--space-8)', backgroundColor: 'transparent' }}>
            <Calendar size={18} style={{ color: 'var(--primary)' }} />
            <div>
              <span className="text-12" style={{ color: 'var(--text-secondary)' }}>Frequency</span>
              <h4 className="text-16" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Monthly</h4>
            </div>
          </Card>
        </div>
      </section>

      {/* Historical logs timeline */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        <h2 className="text-12" style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Timeline Logs
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {item.history ? (
            item.history.map((log, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-12) var(--space-16)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-8)'
                }}
              >
                <div>
                  <p className="text-14" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{log.note || 'Recorded amount'}</p>
                  <p className="text-12" style={{ color: 'var(--text-secondary)' }}>{formatDate(log.date)}</p>
                </div>
                <span className="text-14 font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  ${log.price.toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-12" style={{ color: 'var(--text-secondary)' }}>No past history logged</p>
          )}
        </div>
      </section>

      {/* Modal Dialog for Editing */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Memory"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleEditSave}>
              Save Changes
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          <label className="text-12" style={{ fontWeight: 600 }}>Raw text entry</label>
          <input
            type="text"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-8)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-14)'
            }}
          />
        </div>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Memory"
        message={`Are you sure you want to delete the memory "${getCleanTitle()}"? This action is permanent and cannot be undone.`}
      />

      {/* Success edit toast */}
      {toastMessage && (
        <SnackBar
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}

