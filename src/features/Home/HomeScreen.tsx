import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Tag, ArrowRight, Command, AlertTriangle, ShieldAlert, ShoppingBag } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { SearchInput } from '../../components/SearchInput';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { SnackBar } from '../../components/SnackBar';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { MemoryEngine, CapturePreview } from '../../engine';
import { SearchService } from '../../services/SearchService';
import { ObjectRepository } from '../../database/repositories/ObjectRepository';
import { ActivityRepository } from '../../database/repositories/ActivityRepository';
import { BackupService } from '../../services/BackupService';
import { ReBuyObject, ReBuyActivity } from '../../types';

export function HomeScreen() {
  const { navigateTo } = useNavigation();
  const { setTheme } = useTheme();

  // Inputs & Engine states
  const [query, setQuery] = useState('');
  const [enginePreview, setEnginePreview] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<ReBuyObject[]>([]);
  const [recentActivities, setRecentActivities] = useState<ReBuyActivity[]>([]);
  const [recentTags, setRecentTags] = useState<string[]>([]);
  const [objectMap, setObjectMap] = useState<Record<string, ReBuyObject>>({});

  // Overlay & Alert states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalText, setModalText] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'warning' } | null>(null);
  const [confirmDuplicate, setConfirmDuplicate] = useState<{ isOpen: boolean; preview: CapturePreview } | null>(null);

  // Repositories & Services
  const objectRepo = new ObjectRepository();
  const activityRepo = new ActivityRepository();
  const searchService = new SearchService();
  const backupService = new BackupService();

  // Load database activities and tags on component mount
  useEffect(() => {
    loadDatabaseState();
  }, [query]);

  const loadDatabaseState = async () => {
    try {
      const allObjects = await objectRepo.getAll(true);
      const allActivities = await activityRepo.getAll(false);
      
      // Map objects for quick activity layout name retrieval
      const mapping: Record<string, ReBuyObject> = {};
      allObjects.forEach(o => {
        mapping[o.id] = o;
      });
      setObjectMap(mapping);

      // Set recent activities (limit to top 4)
      setRecentActivities(allActivities.slice(0, 4));

      // Retrieve unique tags
      const tagsSet = new Set<string>();
      allObjects.forEach(o => o.tags.forEach(t => tagsSet.add(t)));
      setRecentTags(Array.from(tagsSet).slice(0, 6));

      // Process input analysis in real time
      if (query.trim()) {
        const result = await MemoryEngine.processInput(query);
        setEnginePreview(result);

        if (result.intent.intent === 'search') {
          // Perform indexed fuzzy query
          const matches = await searchService.search(query);
          setSearchResults(matches);
        }
      } else {
        setEnginePreview(null);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('[HomeScreen] Failed to load data:', error);
    }
  };

  const handleExecuteInput = async () => {
    if (!query.trim() || !enginePreview) return;

    const { intent, preview, commandResult } = enginePreview;

    // 1. Handle Command Execution
    if (intent.intent === 'command' && commandResult) {
      const { action, payload, message } = commandResult;
      
      if (action === 'theme' && payload) {
        setTheme(payload as any);
        setToast({ message, type: 'success' });
      } else if (action === 'navigate' && payload) {
        navigateTo(payload as any);
      } else if (action === 'backup') {
        const json = await backupService.exportData();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ReBuy_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        setToast({ message: 'Database backup downloaded successfully', type: 'success' });
      } else if (action === 'restore') {
        navigateTo('settings'); // Redirect to restore panel
      }
      setQuery('');
      return;
    }

    // 2. Handle Object Action Navigation
    if (intent.intent === 'action' && intent.targetObjectName) {
      // Find the object
      const allObjects = await objectRepo.getAll(true);
      const matched = allObjects.find(o => o.name.toLowerCase() === intent.targetObjectName.toLowerCase());
      if (matched) {
        if (intent.actionType === 'history' || intent.actionType === 'timeline') {
          navigateTo('details', matched.id);
        } else if (intent.actionType === 'edit') {
          navigateTo('details', matched.id); // Resolves edit modal triggers
        } else {
          navigateTo('details', matched.id);
        }
      } else {
        setToast({ message: `Object "${intent.targetObjectName}" not found.`, type: 'danger' });
      }
      setQuery('');
      return;
    }

    // 3. Handle Capture Commit
    if (intent.intent === 'capture' && preview) {
      // Check for duplicate warning confirmations first
      if (preview.duplicateWarning) {
        setConfirmDuplicate({ isOpen: true, preview });
      } else {
        await commitCapture(preview);
      }
    }
  };

  const commitCapture = async (preview: CapturePreview) => {
    try {
      const { object, activity } = await MemoryEngine.commitCapture(preview);
      setToast({
        message: `Saved: ${object.name} - ₹${activity.amount.toFixed(2)} at ${activity.shop || 'Local Store'}`,
        type: 'success'
      });
      setQuery('');
      loadDatabaseState();
    } catch (e) {
      setToast({ message: 'Failed to save memory', type: 'danger' });
    }
  };

  const handleModalSave = async () => {
    if (!modalText.trim()) return;
    try {
      const result = await MemoryEngine.processInput(modalText);
      if (result.preview) {
        await commitCapture(result.preview);
      }
      setModalText('');
      setIsModalOpen(false);
    } catch (e) {
      setToast({ message: 'Failed to save memory', type: 'danger' });
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
      {/* Search Input bar */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <SearchInput
          value={query}
          onChange={setQuery}
          onSubmit={handleExecuteInput}
          placeholder="What do you want to remember?"
        />

        {/* Live Intent Preview HUD */}
        {query.trim() && enginePreview && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {enginePreview.intent.intent === 'command' && enginePreview.commandResult && (
              <Card
                radius="sm"
                onClick={handleExecuteInput}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--primary)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                  <Command size={16} style={{ color: 'var(--primary)' }} />
                  <span className="text-14" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    Run Command: <span style={{ color: 'var(--primary)' }}>{enginePreview.commandResult.message}</span>
                  </span>
                </div>
                <span className="text-12" style={{ color: 'var(--text-secondary)' }}>Press Enter ↵</span>
              </Card>
            )}

            {enginePreview.intent.intent === 'action' && enginePreview.intent.targetObjectName && (
              <Card
                radius="sm"
                onClick={handleExecuteInput}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--primary)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                  <Command size={16} style={{ color: 'var(--primary)' }} />
                  <span className="text-14" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    Go to: <span style={{ color: 'var(--primary)' }}>{enginePreview.intent.targetObjectName} {enginePreview.intent.actionType}</span>
                  </span>
                </div>
                <span className="text-12" style={{ color: 'var(--text-secondary)' }}>Press Enter ↵</span>
              </Card>
            )}

            {enginePreview.intent.intent === 'capture' && enginePreview.preview && (
              <Card
                radius="sm"
                onClick={handleExecuteInput}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-8)',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-card)',
                  borderColor: enginePreview.preview.duplicateWarning ? 'var(--warning)' : 'var(--success)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                    <Sparkles size={16} style={{ color: 'var(--success)' }} />
                    <span className="text-14" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      Quick Capture: <span style={{ fontWeight: 600 }}>{enginePreview.preview.analyzed.matchedObjectName}</span>
                    </span>
                  </div>
                  <span className="text-12" style={{ color: 'var(--text-secondary)' }}>Press Enter ↵</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-16)', color: 'var(--text-secondary)', paddingLeft: '28px' }} className="text-12">
                  {enginePreview.preview.analyzed.amount !== undefined && (
                    <span>Amount: <strong style={{ color: 'var(--text-primary)' }}>₹{enginePreview.preview.analyzed.amount.toFixed(2)}</strong></span>
                  )}
                  {enginePreview.preview.analyzed.shop && (
                    <span>Shop: <strong style={{ color: 'var(--text-primary)' }}>{enginePreview.preview.analyzed.shop}</strong></span>
                  )}
                  {enginePreview.preview.analyzed.quantity && (
                    <span>Qty: <strong style={{ color: 'var(--text-primary)' }}>{enginePreview.preview.analyzed.quantity} {enginePreview.preview.analyzed.unit || 'units'}</strong></span>
                  )}
                </div>

                {enginePreview.preview.duplicateWarning && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', color: 'var(--warning)', marginTop: '4px', paddingLeft: '28px' }} className="text-12">
                    <AlertTriangle size={14} />
                    <span>Warning: Duplicate price of ₹{enginePreview.preview.duplicateWarning.amount.toFixed(2)} logged 5m ago.</span>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </section>

      {/* Dynamic Results vs Dashboard Stream */}
      {query.trim() && enginePreview?.intent.intent === 'search' ? (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <h2 className="text-12" style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Search Matches ({searchResults.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <Card
                  key={item.id}
                  hoverable
                  onClick={() => navigateTo('details', item.id)}
                  style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <h3 className="text-16" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</h3>
                    <p className="text-12" style={{ color: 'var(--text-secondary)' }}>{item.brand || 'No brand'} • {item.defaultShop || 'No shop'}</p>
                  </div>
                  {item.lastAmount !== undefined && (
                    <span className="text-14 font-mono" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      ₹{item.lastAmount.toFixed(2)}
                    </span>
                  )}
                </Card>
              ))
            ) : (
              <div style={{ padding: 'var(--space-24)', textAlign: 'center', color: 'var(--text-secondary)' }} className="text-14">
                No matching memories. Press Enter to search wider tags.
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Tags list */}
          {recentTags.length > 0 && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
              <h2 className="text-12" style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recently Used Tags
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
                {recentTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(`#${tag} `)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--space-8)',
                      padding: 'var(--space-8) var(--space-12)',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-8)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-12)'
                    }}
                  >
                    <Tag size={12} style={{ color: 'var(--text-secondary)' }} />
                    #{tag}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Activity Stream list */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="text-12" style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recent Activity
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigateTo('timeline')}>
                View All
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
              {recentActivities.length > 0 ? (
                recentActivities.map((act) => {
                  const parentObj = objectMap[act.objectId];
                  return (
                    <Card
                      key={act.id}
                      hoverable
                      onClick={() => navigateTo('details', act.objectId)}
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h4 className="text-16" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {parentObj ? parentObj.name : 'Unknown Object'}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }} className="text-12">
                          {act.shop && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ShoppingBag size={10} /> {act.shop}
                            </span>
                          )}
                          <span>{new Date(act.activityDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className="text-16 font-mono" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        ₹{act.amount.toFixed(2)}
                      </span>
                    </Card>
                  );
                })
              ) : (
                <Card
                  radius="lg"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 'var(--space-32)',
                    textAlign: 'center',
                    border: '1px dashed var(--border)',
                    backgroundColor: 'transparent'
                  }}
                >
                  <h4 style={{ fontWeight: 600 }}>Remember your first purchase</h4>
                  <p className="text-12" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Tap + or write in the box above to begin logging memories.
                  </p>
                </Card>
              )}
            </div>
          </section>
        </>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsModalOpen(true)}
        aria-label="Add new memory"
        style={{
          position: 'fixed',
          bottom: 'var(--space-32)',
          right: 'var(--space-32)',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100
        }}
      >
        <Plus size={24} />
      </button>

      {/* Modal capture input sheet */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Remember Something"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleModalSave} disabled={!modalText.trim()}>
              Save Memory
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          <p className="text-14" style={{ color: 'var(--text-secondary)' }}>
            Type your text natural capture. The engine will handle the parsing.
          </p>
          <textarea
            value={modalText}
            onChange={(e) => setModalText(e.target.value)}
            placeholder="e.g. Netflix monthly ₹150 #entertainment"
            style={{
              width: '100%',
              minHeight: '100px',
              padding: 'var(--space-12)',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-12)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-16)',
              outline: 'none',
              fontFamily: 'var(--font-family)',
              resize: 'none'
            }}
          />
        </div>
      </Modal>

      {/* Duplicate confirmation dialog */}
      {confirmDuplicate && (
        <ConfirmationDialog
          isOpen={confirmDuplicate.isOpen}
          onClose={() => setConfirmDuplicate(null)}
          onConfirm={() => commitCapture(confirmDuplicate.preview)}
          title="Duplicate Entry Warning"
          confirmLabel="Log Anyway"
          message={`An activity with an identical price of ₹${confirmDuplicate.preview.analyzed.amount?.toFixed(2)} was logged for "${confirmDuplicate.preview.analyzed.matchedObjectName}" less than 5 minutes ago. Do you wish to log this second activity anyway?`}
        />
      )}

      {/* SnackBar toasts */}
      {toast && (
        <SnackBar
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
