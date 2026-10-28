import React from 'react';
import { ShieldAlert, ArrowLeft, Building2, UserX } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { useNavigate } from 'react-router-dom';

interface InstitutionAccessNoticeProps {
  institutionName: string;
  institutionCode: string;
  targetScope: string;
  collectionTitle: string;
}

export const InstitutionAccessNotice: React.FC<InstitutionAccessNoticeProps> = ({
  institutionName,
  institutionCode,
  targetScope,
  collectionTitle,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-card rounded-2xl border border-rose-200 dark:border-rose-900 shadow-lg p-6 sm:p-8 text-center space-y-6">
        {/* State Emblem / Shield Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <ShieldAlert size={36} />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
            <UserX size={13} /> Exception [E3]: Unauthorized Institution Access
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Access Restricted to Target Institutions
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            You are logged into HIMS Plus as <span className="font-semibold text-foreground">{institutionName}</span> ({institutionCode}).
            However, your institution is not part of the designated target institutions for this information collection.
          </p>
        </div>

        {/* Collection & Target Scope Summary */}
        <div className="bg-muted/40 rounded-xl p-4 text-left border border-border space-y-2.5 text-xs">
          <div className="flex items-start gap-2">
            <Building2 size={16} className="text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Collection Scope:</p>
              <p className="text-muted-foreground">{collectionTitle}</p>
            </div>
          </div>
          <div className="border-t border-border pt-2">
            <p className="font-semibold text-foreground">Permitted Target Institutions:</p>
            <p className="text-amber-800 dark:text-amber-300 font-medium">{targetScope}</p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            type="button"
            variant="primary"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/dashboard')}
          >
            Return to HIMS Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

