import React, { useState } from 'react';
import { X, ShieldCheck, FileText, ExternalLink, User, Info } from 'lucide-react';

interface ImpressumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImpressumModal: React.FC<ImpressumModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'impressum' | 'privacy'>('impressum');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Schließen"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Rechtliche Hinweise</h3>
            <p className="text-xs text-slate-400">Impressum &amp; Datenschutzerklärung für VokabelTrainer</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl mb-6 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('impressum')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'impressum'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={14} />
            <span>Impressum</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'privacy'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Datenschutz</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-2 space-y-6 text-slate-300 text-xs leading-relaxed">
          {activeTab === 'impressum' ? (
            <>
              {/* Angaben gemäß § 5 TMG */}
              <section className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <User size={16} className="text-indigo-400" />
                  <span>Angaben gemäß § 5 TMG / § 18 MStV</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2.5">
                  <div>
                    <p className="font-semibold text-white">Oliver Werner</p>
                    <p className="text-slate-400">Software-Entwickler &amp; Projektbetreiber</p>
                  </div>
                  <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
                    <a
                      href="https://github.com/Oliver19xx/vocabel_trainer/issues"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 hover:text-white hover:bg-indigo-900/60 transition-colors"
                    >
                      <ExternalLink size={14} className="text-indigo-400 shrink-0" />
                      <span>Kontakt &amp; Support via GitHub Issues</span>
                    </a>
                    <a
                      href="https://github.com/Oliver19xx"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <ExternalLink size={14} className="text-slate-400 shrink-0" />
                      <span>GitHub Profil (Oliver19xx)</span>
                    </a>
                  </div>
                </div>
              </section>

              {/* Haftung für Inhalte */}
              <section className="space-y-2">
                <h4 className="text-sm font-bold text-white">Haftung für Inhalte</h4>
                <p>
                  Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den
                  allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
                  verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
                  zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>
                <p>
                  Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen
                  Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
                  Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
                  Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
                </p>
              </section>

              {/* Haftung für Links */}
              <section className="space-y-2">
                <h4 className="text-sm font-bold text-white">Haftung für Links</h4>
                <p>
                  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss
                  haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
                  verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                </p>
              </section>

              {/* Urheberrecht */}
              <section className="space-y-2">
                <h4 className="text-sm font-bold text-white">Urheberrecht</h4>
                <p>
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
                  deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung
                  außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors
                  bzw. Erstellers.
                </p>
              </section>
            </>
          ) : (
            <>
              {/* Datenschutzhinweise */}
              <section className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Info size={16} className="text-indigo-400" />
                  <span>1. Datenschutz auf einen Blick</span>
                </h4>
                <p>
                  Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Diese Anwendung kann
                  vollständig ohne Angabe personenbezogener Daten genutzt werden. Wir erfassen, verarbeiten und
                  verkaufen keine personenbezogenen Nutzerdaten zu Werbe- oder Marketingzwecken.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-sm font-bold text-white">2. Lokale Datenspeicherung (Gast-Modus)</h4>
                <p>
                  Im Standardbetrieb werden alle erstellten Decks, Lernkarten, Wiederholungsintervalle (Spaced
                  Repetition) und Lernstatistiken ausschließlich lokal in Ihrem Browser (über das Web Storage API /
                  LocalStorage) gespeichert. Es findet keine automatische Übertragung dieser Daten an externe Server
                  statt.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-sm font-bold text-white">3. Optionale Cloud-Synchronisation (Supabase BYOD)</h4>
                <p>
                  Die App bietet optional die Möglichkeit, eine eigene Supabase-Datenbank zu verbinden (&bdquo;Bring
                  Your Own Database&ldquo;). Sofern Sie Ihre eigenen Supabase-API-Schlüssel eintragen und den Login via
                  Google nutzen, werden Ihre Kartendaten, Decks und Fortschritte in Ihrer persönlichen
                  Supabase-Instanz synchronisiert.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-sm font-bold text-white">4. Hosting &amp; Bereitstellung</h4>
                <p>
                  Diese Webanwendung wird über <strong>GitHub Pages</strong> (GitHub Inc., 88 Colin P Kelly Jr St, San
                  Francisco, CA 94107, USA) gehostet. Beim Aufruf der Webseite können durch den Hosting-Provider
                  technisch erforderliche Server-Logfiles (z.&nbsp;B. IP-Adresse, Browser-Typ, Zeitpunkt des Zugriffs)
                  erfasst werden.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-sm font-bold text-white">5. Audio-Aussprache (Web Speech API)</h4>
                <p>
                  Für die Sprachausgabe der Vokabeln nutzt die Anwendung die standardmäßig im Webbrowser integrierte
                  Sprachsynthese-Schnittstelle (Web Speech API). Die Sprachverarbeitung erfolgt je nach
                  Betriebssystem und Browser lokal auf Ihrem Endgerät.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-sm font-bold text-white">6. Ihre Rechte</h4>
                <p>
                  Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Herkunft, Empfänger und Zweck Ihrer
                  gespeicherten Daten sowie ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
