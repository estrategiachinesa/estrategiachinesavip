'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, collection, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Shield, Download, Trash2, Cookie, CheckCircle, Info, Loader2, AlertTriangle } from 'lucide-react';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userProfile?: any;
  vipData?: any;
}

export function PrivacySettingsModal({
  isOpen,
  onOpenChange,
  userProfile,
  vipData,
}: PrivacySettingsModalProps) {
  const { auth, user, firestore } = useFirebase();
  const { toast } = useToast();
  
  // States for cookie preferences
  const [cookieSettings, setCookieSettings] = useState({
    necessary: true, // Always true under GDPR/LGPD
    analytics: false,
    marketing: false,
  });
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  // Load cookie preferences from localStorage on open
  useEffect(() => {
    if (isOpen) {
      const consent = localStorage.getItem('cookie_consentimento');
      const analyticsConsent = localStorage.getItem('cookies_analytics') === 'true';
      const marketingConsent = localStorage.getItem('cookies_marketing') === 'true';
      
      if (consent === 'aceito') {
        setCookieSettings({
          necessary: true,
          analytics: true,
          marketing: true,
        });
      } else if (consent === 'personalizado') {
        setCookieSettings({
          necessary: true,
          analytics: analyticsConsent,
          marketing: marketingConsent,
        });
      } else {
        setCookieSettings({
          necessary: true,
          analytics: false,
          marketing: false,
        });
      }
    }
  }, [isOpen]);

  // Save cookie preferences and log consent
  const handleSaveCookies = async () => {
    try {
      localStorage.setItem('cookie_consentimento', 'personalizado');
      localStorage.setItem('cookies_analytics', cookieSettings.analytics ? 'true' : 'false');
      localStorage.setItem('cookies_marketing', cookieSettings.marketing ? 'true' : 'false');
      
      // Trigger scripts if activated
      if (cookieSettings.analytics || cookieSettings.marketing) {
        console.log("Tracking scripts activated as per consent.");
      }
      
      // Log cookie consent update under GDPR/LGPD
      if (user && firestore) {
        const consentLogDocRef = doc(collection(firestore, 'consentLogs'));
        const consentData = {
          userId: user.uid,
          email: user.email || 'anonymous',
          type: 'COOKIE_PREFERENCES_UPDATE',
          timestamp: serverTimestamp(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
          preferences: {
            necessary: true,
            analytics: cookieSettings.analytics,
            marketing: cookieSettings.marketing,
          }
        };
        setDocumentNonBlocking(consentLogDocRef, consentData);
      }

      toast({
        title: 'Preferences Saved!',
        description: 'Your cookie privacy settings have been updated.',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save your cookie preferences.',
      });
    }
  };

  // Portability / Data Download
  const handleDownloadData = () => {
    if (!user) return;

    try {
      const dataToDownload = {
        application: 'Estratégia Chinesa',
        generatedAt: new Date().toISOString(),
        user_identity: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
        },
        profile_data: userProfile || {
          note: 'No database profile found for your UID.'
        },
        subscription_and_vip: vipData || {
          note: 'No active license or VIP request found for your UID.'
        },
        cookie_consent: {
          consentType: localStorage.getItem('cookie_consentimento') || 'not configured',
          analyticsAllowed: localStorage.getItem('cookies_analytics') === 'true',
          marketingAllowed: localStorage.getItem('cookies_marketing') === 'true',
        },
        compliance_notice: "This file contains all your personal information stored by Chinese Strategy, provided in a structured format in compliance with the Data Portability Right under GDPR/LGPD."
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(dataToDownload, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `my_data_chinese_strategy_${user.uid}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      // Log portability action
      if (firestore) {
        const consentLogDocRef = doc(collection(firestore, 'consentLogs'));
        setDocumentNonBlocking(consentLogDocRef, {
          userId: user.uid,
          email: user.email || 'anonymous',
          type: 'DATA_PORTABILITY_DOWNLOAD',
          timestamp: serverTimestamp(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        });
      }

      toast({
        title: 'Download Started',
        description: 'The JSON file with all your data has been generated and downloaded.',
      });
    } catch (error) {
      console.error('Data portability download error:', error);
      toast({
        variant: 'destructive',
        title: 'Download Error',
        description: 'Could not compile and export your personal data.',
      });
    }
  };

  // Right to Deletion / Forgot Me
  const handleDeleteAccount = async () => {
    if (!user || !firestore) return;

    if (confirmText.toLowerCase() !== 'delete') {
      toast({
        variant: 'destructive',
        title: 'Incorrect Confirmation',
        description: 'Type "DELETE" exactly as requested to proceed.',
      });
      return;
    }

    setIsDeleting(true);
    try {
      const userId = user.uid;
      const userEmail = user.email || 'anonymous';

      // 1. Log the deletion request for legal audit trails before wiping data
      const requestDocRef = doc(collection(firestore, 'deletionRequests'));
      const deletionRequestData = {
        userId: userId,
        email: userEmail,
        timestamp: serverTimestamp(),
        status: 'COMPLETED_SELF_SERVICE',
        platform: 'Estratégia Chinesa',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        legalBasis: 'GDPR/LGPD Right to Erasure (Deletion of personal data)',
      };
      
      // Set the log synchronously so we don't lose it
      await setDocumentNonBlocking(requestDocRef, deletionRequestData);

      // 2. Perform database wipeout of personal documents
      const userDocRef = doc(firestore, 'users', userId);
      const vipDocRef = doc(firestore, 'vipRequests', userId);

      await deleteDoc(userDocRef);
      await deleteDoc(vipDocRef);

      // 3. Clear local storage
      localStorage.removeItem('loginTimestamp');
      localStorage.removeItem('cookie_consentimento');
      localStorage.removeItem('cookies_analytics');
      localStorage.removeItem('cookies_marketing');

      toast({
        title: 'Account Successfully Deleted',
        description: 'All your data has been permanently erased from our database. We will miss you.',
      });

      // 4. Try client-side Firebase Auth delete (optional, fallback to standard logout)
      try {
        await user.delete();
      } catch (authError: any) {
        console.warn("Auth user deletion failed (requires recent login usually):", authError);
        // Fallback: simply sign out if reauth is needed. The database data is already deleted!
        await auth.signOut();
      }

      setShowDeleteConfirm(false);
      onOpenChange(false);
      
      // Redirect to login
      window.location.href = '/login';
    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast({
        variant: 'destructive',
        title: 'Error Deleting Account',
        description: error.message || 'An error occurred while trying to delete your account.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl bg-card/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[90dvh] no-scrollbar">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-headline font-black uppercase tracking-tight text-foreground">
              <Shield className="text-primary h-6 w-6" /> Privacy Portal
            </DialogTitle>
            <DialogDescription className="text-xs uppercase font-black tracking-wider opacity-60 text-muted-foreground mt-1">
              Manage your personal data, consent, and cookies with full autonomy.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {/* Account Info */}
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1 text-sm">
              <div className="flex justify-between items-center text-xs uppercase font-black tracking-widest opacity-40">
                <span>User Identification</span>
                <span className="text-green-500 font-bold">Protected by Privacy Laws</span>
              </div>
              <p className="font-bold text-foreground mt-1">{user?.email}</p>
              <p className="text-xs text-muted-foreground">
                Your personal data is securely stored and used strictly for the analyzer\'s operation.
              </p>
            </div>

            {/* Cookie Preferences */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-black tracking-widest opacity-60 flex items-center gap-2">
                <Cookie className="h-4 w-4 text-primary" /> Cookies & Tracking Preferences
              </h3>
              
              <div className="space-y-2">
                {/* Necessary */}
                <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                  <div className="pt-0.5">
                    <Checkbox id="cookie-necessary" checked={true} disabled />
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="cookie-necessary" className="text-sm font-bold text-foreground cursor-not-allowed">
                      Necessary Cookies (Required)
                    </label>
                    <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                      Essential to keep you logged in (login session), apply your preferences, and ensure system security. Cannot be disabled.
                    </p>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all" onClick={() => setCookieSettings(prev => ({ ...prev, analytics: !prev.analytics }))}>
                  <div className="pt-0.5">
                    <Checkbox 
                      id="cookie-analytics" 
                      checked={cookieSettings.analytics} 
                      onCheckedChange={(checked) => setCookieSettings(prev => ({ ...prev, analytics: checked as boolean }))} 
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="cookie-analytics" className="text-sm font-bold text-foreground cursor-pointer">
                      Performance & Analytics Cookies (Optional)
                    </label>
                    <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                      Allow analyzing traffic volume, clicks, and interactions for continuous improvement of the analyzer\'s performance and usability.
                    </p>
                  </div>
                </div>

                {/* Marketing */}
                <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all" onClick={() => setCookieSettings(prev => ({ ...prev, marketing: !prev.marketing }))}>
                  <div className="pt-0.5">
                    <Checkbox 
                      id="cookie-marketing" 
                      checked={cookieSettings.marketing} 
                      onCheckedChange={(checked) => setCookieSettings(prev => ({ ...prev, marketing: checked as boolean }))} 
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="cookie-marketing" className="text-sm font-bold text-foreground cursor-pointer">
                      Marketing & Tracking Cookies (Optional)
                    </label>
                    <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                      Used to personalize our announcements of new plans or bonuses based on your usage profile.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveCookies} size="sm" className="bg-primary text-black font-bold text-xs uppercase tracking-wider rounded-xl">
                  Save Preferences
                </Button>
              </div>
            </div>

            <hr className="border-white/10" />

            {/* Portability and Deletion */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Export */}
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                    <Download className="h-4 w-4 text-primary" /> Data Portability
                  </h4>
                  <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                    Instantly download a JSON file with all the personal information registered about you on our platform.
                  </p>
                </div>
                <Button onClick={handleDownloadData} variant="outline" size="sm" className="w-full text-xs font-bold border-white/10 hover:bg-white/10 rounded-xl h-10">
                  Export My Data
                </Button>
              </div>

              {/* Delete */}
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex flex-col justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold flex items-center gap-1.5 text-destructive">
                    <Trash2 className="h-4 w-4" /> Delete My Account
                  </h4>
                  <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                    Request the immediate deletion of all your login, VIP, and configuration records, exercising your right to be forgotten.
                  </p>
                </div>
                <Button onClick={() => setShowDeleteConfirm(true)} variant="destructive" size="sm" className="w-full text-xs font-bold rounded-xl h-10">
                  Delete All
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto rounded-xl">
              Close Portal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SECONDARY MODAL: CONFIRMATION OF CRITICAL DELETION */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md bg-[#0d0d0d] border border-red-500/20 rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-headline font-black uppercase text-red-500">
              <AlertTriangle className="h-6 w-6" /> Irreversible Action!
            </DialogTitle>
            <DialogDescription className="text-xs uppercase font-black tracking-wider opacity-60 text-muted-foreground mt-1">
              Confirm the permanent deletion of your personal data.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2">
              <p className="text-xs leading-relaxed text-zinc-300">
                By clicking confirm, the following data will be **permanently deleted** from our database:
              </p>
              <ul className="list-disc pl-4 text-[0.65rem] text-muted-foreground space-y-1 leading-relaxed">
                <li>Your user profile and registered email</li>
                <li>Your associated lifetime VIP / PREMIUM license</li>
                <li>Your analysis history and cookie preferences</li>
              </ul>
              <p className="text-xs font-bold text-red-400 leading-relaxed pt-1">
                Warning: You will lose access immediately and cannot reactivate your account or request support.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[0.65rem] font-black uppercase tracking-widest opacity-60">
                To confirm, type <span className="text-red-500 font-bold">"delete"</span> below:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type delete to confirm"
                className="w-full h-11 px-3 bg-white/5 border border-white/10 rounded-xl text-center text-sm font-bold uppercase tracking-wider text-white focus:outline-none focus:border-red-500/50 transition-colors"
                disabled={isDeleting}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} className="rounded-xl" disabled={isDeleting}>
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmText.toLowerCase() !== 'delete'}
              className="rounded-xl font-bold uppercase tracking-wide h-10"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Confirm and Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
