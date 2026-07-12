import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, Tag, Edit3, Trash2, ShieldAlert, Sparkles, TrendingDown, ArrowLeft, RefreshCw, ShoppingCart, User, Plus } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { SnackBar } from '../../components/SnackBar';
import { ObjectRepository } from '../../database/repositories/ObjectRepository';
import { ActivityRepository } from '../../database/repositories/ActivityRepository';
import { StatisticsService } from '../../services/StatisticsService';
import { ReBuyObject, ReBuyActivity, ObjectStatistics } from '../../types';

export function DetailsScreen() {
  const { selectedItemId, navigateTo, goBack } = useNavigation();

  // DB States
  const [object, setObject] = useState<ReBuyObject | null>(null);
  const [activities, setActivities] = useState<ReBuyActivity[]>([]);
  const [stats, setStats] = useState<ObjectStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [highlightedActivityId, setHighlightedActivityId] = useState<string | null>(null);

  // Modal / Form States
  const [isRecordAgainOpen, setIsRecordAgainOpen] = useState(false);
  const [recordAmount, setRecordAmount] = useState('');
  const [recordShop, setRecordShop] = useState('');
  const [recordQty, setRecordQty] = useState('');
  const [recordUnit, setRecordUnit] = useState('');
  const [recordRemarks, setRecordRemarks] = useState('');

  const [isEditObjectOpen, setIsEditObjectOpen] = useState(false);
  const [editObjectName, setEditObjectName] = useState('');
  const [editObjectBrand, setEditObjectBrand] = useState('');
  const [editObjectTags, setEditObjectTags] = useState('');

  const [editActivity, setEditActivity] = useState<ReBuyActivity | null>(null);
  const [editActivityAmount, setEditActivityAmount] = useState('');
  const [editActivityRemarks, setEditActivityRemarks] = useState('');

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  // Repository instances
  const objectRepo = new ObjectRepository();
  const activityRepo = new ActivityRepository();

  useEffect(() => {
    if (selectedItemId) {
      loadData();
    }
  }, [selectedItemId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const obj = await objectRepo.get(selectedItemId!);
      if (obj) {
        setObject(obj);
        // Pre-populate edits
        setEditObjectName(obj.name);
        setEditObjectBrand(obj.brand || '');
        setEditObjectTags(obj.tags.join(', '));

        // Pre-populate Record Again defaults
        setRecordShop(obj.defaultShop || '');
        setRecordQty(obj.defaultQuantity ? obj.defaultQuantity.toString() : '1');
        setRecordUnit(obj.defaultUnit || 'unit');

        const list = await activityRepo.getByObjectId(selectedItemId!);
        setActivities(list);

        // Calculate statistics dynamically via StatisticsService
        const computedStats = StatisticsService.calculate(list);
        setStats(computedStats);
      }
    } catch (e) {
      console.error(e);
      setToast({ message: 'Failed to load memory details', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleRecordAgain = async () => {
    if (!object || !recordAmount.trim()) return;

    try {
      const timestamp = new Date().toISOString();
      const newActivity: ReBuyActivity = {
        id: Math.random().toString(36).substring(2, 11),
        objectId: object.id,
        activityType: object.type as any || 'purchase',
        amount: parseFloat(recordAmount),
        quantity: parseInt(recordQty) || 1,
        unit: recordUnit || 'unit',
        shop: recordShop.trim() || undefined,
        remarks: recordRemarks.trim() || undefined,
        activityDate: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
        isArchived: false
      };

      await activityRepo.save(newActivity);
      
      // Update object cache details
      const allActivities = await activityRepo.getByObjectId(object.id);
      const updatedObject = {
        ...object,
        purchaseCount: allActivities.length,
        lastAmount: newActivity.amount,
        lastActivityDate: newActivity.activityDate,
        updatedAt: timestamp
      };
      await objectRepo.save(updatedObject);

      setToast({ message: 'Recorded successfully', type: 'success' });
      setIsRecordAgainOpen(false);
      setRecordAmount('');
      setRecordRemarks('');
      loadData();
    } catch (e) {
      setToast({ message: 'Failed to record activity', type: 'danger' });
    }
  };

  const handleEditObjectSave = async () => {
    if (!object || !editObjectName.trim()) return;

    try {
      const updated: ReBuyObject = {
        ...object,
        name: editObjectName.trim(),
        brand: editObjectBrand.trim() || undefined,
        tags: editObjectTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        updatedAt: new Date().toISOString()
      };
      await objectRepo.save(updated);
      setIsEditObjectOpen(false);
      setToast({ message: 'Memory updated successfully', type: 'success' });
      loadData();
    } catch (e) {
      setToast({ message: 'Failed to save modifications', type: 'danger' });
    }
  };

  const handleEditActivitySave = async () => {
    if (!editActivity || !editActivityAmount.trim()) return;

    try {
      const updated: ReBuyActivity = {
        ...editActivity,
        amount: parseFloat(editActivityAmount),
        remarks: editActivityRemarks.trim() || undefined,
        updatedAt: new Date().toISOString()
      };
      await activityRepo.save(updated);
      setEditActivity(null);
      setToast({ message: 'Log entry updated', type: 'success' });
      loadData();
    } catch (e) {
      setToast({ message: 'Failed to edit log entry', type: 'danger' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!object) return;
    try {
      // Archive or delete memory object
      await objectRepo.delete(object.id);
      // Clear associated activities
      for (const act of activities) {
        await activityRepo.delete(act.id);
      }
      setIsDeleteOpen(false);
      navigateTo('timeline');
    } catch (e) {
      setToast({ message: 'Failed to delete memory', type: 'danger' });
    }
  };

  const getPriceDifference = () => {
    if (activities.length < 2) return null;
    const current = activities[0].amount / (activities[0].quantity || 1);
    const previous = activities[1].amount / (activities[1].quantity || 1);
    const diff = current - previous;
    const unitLabel = object?.defaultUnit || activities[0].unit || 'unit';

    if (diff > 0) {
      return {
        text: `↑ ₹${diff.toFixed(2)}/${unitLabel} since last purchase`,
        color: 'var(--danger)' // Soft Red
      };
    } else if (diff < 0) {
      return {
        text: `↓ ₹${Math.abs(diff).toFixed(2)}/${unitLabel} cheaper than last purchase`,
        color: 'var(--success)' // Soft Green
      };
    } else {
      return {
        text: 'No change',
        color: 'var(--text-secondary)'
      };
    }
  };

  const handleHighlightLowest = () => {
    if (!stats || activities.length === 0) return;
    const lowestAct = activities.find(
      a => !a.isArchived && Math.abs(a.amount / (a.quantity || 1) - stats.lowestAmount) < 0.001
    );
    if (lowestAct) {
      setHighlightedActivityId(lowestAct.id);
      setTimeout(() => {
        const element = document.getElementById(`activity-${lowestAct.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      setTimeout(() => {
        setHighlightedActivityId(null);
      }, 2500);
    }
  };

  const handleHighlightHighest = () => {
    if (!stats || activities.length === 0) return;
    const highestAct = activities.find(
      a => !a.isArchived && Math.abs(a.amount / (a.quantity || 1) - stats.highestAmount) < 0.001
    );
    if (highestAct) {
      setHighlightedActivityId(highestAct.id);
      setTimeout(() => {
        const element = document.getElementById(`activity-${highestAct.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      setTimeout(() => {
        setHighlightedActivityId(null);
      }, 2500);
    }
  };

  // Compare groupings based on Unit Price (amount/quantity) and ignoring undefined shop
  const getCompareGroups = () => {
    const shopGroups: Record<string, { min: number; max: number; last: number; count: number }> = {};
    
    activities.forEach(act => {
      if (!act.isArchived && act.shop && act.shop.trim() && act.shop.toLowerCase() !== 'unknown shop') {
        const shop = act.shop.trim();
        const unitPrice = act.amount / (act.quantity || 1);
        if (!shopGroups[shop]) {
          shopGroups[shop] = { min: unitPrice, max: unitPrice, last: unitPrice, count: 0 };
        } else {
          shopGroups[shop].min = Math.min(shopGroups[shop].min, unitPrice);
          shopGroups[shop].max = Math.max(shopGroups[shop].max, unitPrice);
        }
        shopGroups[shop].count++;
      }
    });

    return Object.entries(shopGroups).map(([shop, data]) => ({
      shop,
      ...data
    }));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-14" style={{ textAlign: 'center', padding: 'var(--space-48)' }}>Loading memory details...</div>;
  }

  if (!object) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)', alignItems: 'center', padding: 'var(--space-48)' }}>
        <ShieldAlert size={48} style={{ color: 'var(--danger)' }} />
        <h2 className="text-20">Memory Not Found</h2>
        <Button onClick={() => navigateTo('home')}>Go Home</Button>
      </div>
    );
  }

  const diff = getPriceDifference();
  const comparisonList = getCompareGroups();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
      {/* 1. TOP SECTION (Overview) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="text-28" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>{object.name}</h1>
              {object.brand && <p className="text-14" style={{ color: 'var(--text-secondary)' }}>Brand: {object.brand}</p>}
            </div>
            {object.lastAmount !== undefined && (
              <div style={{ textAlign: 'right' }}>
                <span className="text-28 font-mono" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  ₹{(object.lastAmount / (object.defaultQuantity || 1)).toFixed(2)}
                  <span className="text-14" style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>/{object.defaultUnit || 'unit'}</span>
                </span>
                <p className="text-12" style={{ color: 'var(--text-secondary)' }}>
                  Latest: ₹{object.lastAmount.toFixed(2)} for {object.defaultQuantity} {object.defaultUnit}
                </p>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-16)', marginTop: 'var(--space-8)' }}>
            {object.lastActivityDate && (
              <span className="text-12" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> Last recorded: {formatDate(object.lastActivityDate)}
              </span>
            )}
            {diff && (
              <span className="text-12" style={{ color: diff.color, fontWeight: 600 }}>
                {diff.text}
              </span>
            )}
          </div>
        </div>

        {/* Primary Record Again button */}
        <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
          <Button variant="primary" onClick={() => setIsRecordAgainOpen(true)} icon={<Plus size={16} />} style={{ flexGrow: 1 }}>
            Record Again
          </Button>
          <Button variant="secondary" onClick={() => setIsEditObjectOpen(true)} icon={<Edit3 size={16} />}>
            Edit
          </Button>
          <Button variant="ghost" onClick={() => setIsDeleteOpen(true)} icon={<Trash2 size={16} />} style={{ color: 'var(--danger)' }} />
        </div>
      </section>

      {/* 3. INSIGHTS SECTION */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        <h2 className="text-12" style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Insights
        </h2>
        
        {activities.length <= 1 ? (
          <Card radius="md" style={{ borderStyle: 'dashed', backgroundColor: 'transparent', padding: 'var(--space-24)', textAlign: 'center' }}>
            <Sparkles size={24} style={{ color: 'var(--primary)', margin: '0 auto var(--space-8)' }} />
            <p className="text-14" style={{ color: 'var(--text-secondary)' }}>
              This is your first activity log. More history will unlock automatic insights.
            </p>
          </Card>
        ) : (
          stats && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)' }}>
              <Card
                radius="md"
                hoverable
                onClick={handleHighlightLowest}
                style={{
                  gap: '4px',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(34, 197, 94, 0.06)',
                  borderColor: highlightedActivityId ? 'var(--primary)' : 'rgba(34, 197, 94, 0.2)',
                  color: '#22C55E'
                }}
              >
                <span className="text-12" style={{ color: 'var(--text-secondary)' }}>Lowest Cost ({object.defaultUnit || 'unit'})</span>
                <span className="text-16 font-mono" style={{ fontWeight: 600 }}>₹{stats.lowestAmount.toFixed(2)}</span>
              </Card>
              <Card
                radius="md"
                hoverable
                onClick={handleHighlightHighest}
                style={{
                  gap: '4px',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(239, 68, 68, 0.06)',
                  borderColor: highlightedActivityId ? 'var(--primary)' : 'rgba(239, 68, 68, 0.2)',
                  color: '#EF4444'
                }}
              >
                <span className="text-12" style={{ color: 'var(--text-secondary)' }}>Highest Cost ({object.defaultUnit || 'unit'})</span>
                <span className="text-16 font-mono" style={{ fontWeight: 600 }}>₹{stats.highestAmount.toFixed(2)}</span>
              </Card>
              <Card
                radius="md"
                style={{
                  gap: '4px',
                  backgroundColor: 'rgba(37, 99, 235, 0.06)',
                  borderColor: 'rgba(37, 99, 235, 0.2)',
                  color: 'var(--primary)'
                }}
              >
                <span className="text-12" style={{ color: 'var(--text-secondary)' }}>Average Price ({object.defaultUnit || 'unit'})</span>
                <span className="text-16 font-mono" style={{ fontWeight: 600 }}>₹{stats.averageAmount.toFixed(2)}</span>
              </Card>
              <Card
                radius="md"
                style={{
                  gap: '4px',
                  backgroundColor: 'rgba(168, 85, 247, 0.06)',
                  borderColor: 'rgba(168, 85, 247, 0.2)',
                  color: '#A855F7'
                }}
              >
                <span className="text-12" style={{ color: 'var(--text-secondary)' }}>Most Used Shop</span>
                <span className="text-16" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{stats.mostUsedShop}</span>
              </Card>
            </div>
          )
        )}
      </section>

      {/* 4. COMPARE SECTION */}
      {comparisonList.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          <h2 className="text-12" style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Compare Prices by Shop
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {comparisonList.map((c) => (
              <div
                key={c.shop}
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
                  <span className="text-14" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.shop}</span>
                  <p className="text-12" style={{ color: 'var(--text-secondary)' }}>Logged {c.count} times</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span className="text-12" style={{ color: 'var(--text-secondary)' }}>Min/Max ({object.defaultUnit || 'unit'})</span>
                    <p className="text-12 font-mono" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      ₹{c.min.toFixed(2)} - ₹{c.max.toFixed(2)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="text-12" style={{ color: 'var(--text-secondary)' }}>Last logged ({object.defaultUnit || 'unit'})</span>
                    <p className="text-14 font-mono" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      ₹{c.last.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. SECOND SECTION (Timeline Activities) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        <h2 className="text-12" style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Activity Log Timeline
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          {activities.map((act) => {
            const isHighlighted = act.id === highlightedActivityId;
            return (
              <Card
                key={act.id}
                id={`activity-${act.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-16)',
                  border: '1px solid var(--border)',
                  borderLeft: isHighlighted ? '4px solid var(--primary)' : '3px solid var(--border)',
                  borderRadius: 'var(--radius-8)',
                  backgroundColor: isHighlighted ? 'var(--bg-hover)' : 'var(--bg-card)',
                  boxShadow: isHighlighted ? '0 0 16px rgba(37, 99, 235, 0.25)' : 'none',
                  transition: 'all 0.3s ease-in-out'
                }}
              >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span className="text-16 font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    ₹{act.amount.toFixed(2)}
                  </span>
                  <span className="text-12" style={{ color: 'var(--text-secondary)' }}>
                    ({act.quantity} {act.unit || 'unit'})
                  </span>
                  {act.quantity > 1 && (
                    <span className="text-12" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>
                      • ₹{(act.amount / act.quantity).toFixed(2)}/{act.unit || 'unit'}
                    </span>
                  )}
                  {act.remarks && (
                    <span
                      className="text-12"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 8px',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        color: 'var(--primary)',
                        border: '1px solid rgba(37, 99, 235, 0.15)',
                        borderRadius: 'var(--radius-8)',
                        fontWeight: 500,
                        marginLeft: '4px'
                      }}
                    >
                      {act.remarks}
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', color: 'var(--text-secondary)' }} className="text-12">
                  {act.shop && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShoppingBag size={10} /> {act.shop}
                    </span>
                  )}
                  <span>• {formatDate(act.activityDate)}</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditActivity(act);
                  setEditActivityAmount(act.amount.toString());
                  setEditActivityRemarks(act.remarks || '');
                }}
                icon={<Edit3 size={14} />}
                style={{ padding: '4px 8px', height: '32px' }}
              >
                Edit
              </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* MODAL: Record Again (Amount prefill only) */}
      <Modal
        isOpen={isRecordAgainOpen}
        onClose={() => setIsRecordAgainOpen(false)}
        title={`Record Again: ${object.name}`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsRecordAgainOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRecordAgain} disabled={!recordAmount.trim()}>
              Save Log
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="text-12" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Enter Amount (₹)</label>
            <input
              autoFocus
              type="number"
              step="0.01"
              value={recordAmount}
              onChange={(e) => setRecordAmount(e.target.value)}
              placeholder="e.g. 5.99"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-8)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-16)'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-12" style={{ color: 'var(--text-secondary)' }}>Shop (Prefilled)</label>
              <input
                type="text"
                value={recordShop}
                onChange={(e) => setRecordShop(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-8)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-14)'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-12" style={{ color: 'var(--text-secondary)' }}>Quantity</label>
              <input
                type="number"
                value={recordQty}
                onChange={(e) => setRecordQty(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-8)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-14)'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="text-12" style={{ color: 'var(--text-secondary)' }}>Remarks</label>
            <input
              type="text"
              value={recordRemarks}
              onChange={(e) => setRecordRemarks(e.target.value)}
              placeholder="Any additional notes"
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-8)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-14)'
              }}
            />
          </div>
        </div>
      </Modal>

      {/* MODAL: Edit Object attributes */}
      <Modal
        isOpen={isEditObjectOpen}
        onClose={() => setIsEditObjectOpen(false)}
        title="Edit Memory Name"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsEditObjectOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleEditObjectSave}>
              Save Changes
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="text-12" style={{ fontWeight: 600 }}>Memory Name</label>
            <input
              type="text"
              value={editObjectName}
              onChange={(e) => setEditObjectName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-8)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-14)'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="text-12" style={{ fontWeight: 600 }}>Brand</label>
            <input
              type="text"
              value={editObjectBrand}
              onChange={(e) => setEditObjectBrand(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-8)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-14)'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="text-12" style={{ fontWeight: 600 }}>Tags (comma separated)</label>
            <input
              type="text"
              value={editObjectTags}
              onChange={(e) => setEditObjectTags(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-8)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-14)'
              }}
            />
          </div>
        </div>
      </Modal>

      {/* MODAL: Edit Activity logs details */}
      <Modal
        isOpen={editActivity !== null}
        onClose={() => setEditActivity(null)}
        title="Edit Log Entry"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditActivity(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleEditActivitySave}>
              Save Entry
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="text-12" style={{ fontWeight: 600 }}>Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              value={editActivityAmount}
              onChange={(e) => setEditActivityAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-8)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-14)'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="text-12" style={{ fontWeight: 600 }}>Remarks</label>
            <input
              type="text"
              value={editActivityRemarks}
              onChange={(e) => setEditActivityRemarks(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-8)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-14)'
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Memory"
        message={`Are you sure you want to delete the memory object "${object.name}" and all its logs? This action is permanent.`}
      />

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
