import React, { useState, useEffect, useRef } from 'react';
import { 
  HelpCircle, X, ChevronRight, ChevronLeft, 
  Lightbulb, Info, AlertCircle, CheckCircle,
  Play, Pause, RotateCcw, ArrowRight
} from 'lucide-react';
import { AccessibleButton } from './AccessibleComponents';
import { useResponsive } from './ResponsiveLayout';

// Tooltip Component
export const Tooltip = ({ 
  children, 
  content, 
  position = 'top',
  delay = 500,
  disabled = false,
  maxWidth = '250px'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  const showTooltip = () => {
    if (disabled) return;
    const timeout = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(timeout);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const positionStyles = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: '8px'
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: '8px'
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: '8px'
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: '8px'
    }
  };

  return (
    <div 
      ref={triggerRef}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: 'absolute',
            zIndex: 9999,
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            lineHeight: '1.4',
            maxWidth: maxWidth,
            wordWrap: 'break-word',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            ...positionStyles[position]
          }}
        >
          {content}
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              ...(position === 'top' && {
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                borderTop: '5px solid #1f2937'
              }),
              ...(position === 'bottom' && {
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                borderBottom: '5px solid #1f2937'
              }),
              ...(position === 'left' && {
                left: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                borderLeft: '5px solid #1f2937',
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent'
              }),
              ...(position === 'right' && {
                right: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                borderRight: '5px solid #1f2937',
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent'
              })
            }}
          />
        </div>
      )}
    </div>
  );
};

// Help Icon with Tooltip
export const HelpIcon = ({ tooltip, size = '16px' }) => (
  <Tooltip content={tooltip} position="top">
    <HelpCircle 
      style={{ 
        width: size, 
        height: size, 
        color: '#6b7280',
        cursor: 'help'
      }} 
    />
  </Tooltip>
);

// Contextual Help Panel
export const ContextualHelp = ({ 
  isOpen, 
  onClose, 
  title,
  steps = [],
  tips = [],
  shortcuts = []
}) => {
  const { isMobile } = useResponsive();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: isOpen ? 0 : '-400px',
      width: isMobile ? '100vw' : '400px',
      height: '100vh',
      backgroundColor: 'white',
      boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
      transition: 'right 0.3s ease',
      zIndex: 3000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          margin: 0,
          color: '#111827'
        }}>
          {title || 'Help & Tips'}
        </h2>
        <AccessibleButton
          variant="ghost"
          size="sm"
          onClick={onClose}
          icon={<X style={{ width: '20px', height: '20px' }} />}
          ariaLabel="Close help panel"
        />
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto'
      }}>
        {/* Steps */}
        {steps.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
              How to use this feature
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {steps.map((step, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      margin: 0,
                      marginBottom: '4px',
                      color: '#111827'
                    }}>
                      {step.title}
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {tips.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Lightbulb style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
              Pro Tips
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tips.map((tip, index) => (
                <div key={index} style={{
                  padding: '12px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fed7aa',
                  borderRadius: '8px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: '#92400e'
                }}>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shortcuts */}
        {shortcuts.length > 0 && (
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>⌨️</span>
              Keyboard Shortcuts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {shortcuts.map((shortcut, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>
                    {shortcut.description}
                  </span>
                  <code style={{
                    padding: '2px 6px',
                    backgroundColor: '#111827',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}>
                    {shortcut.keys}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Interactive Tutorial Component
export const InteractiveTutorial = ({ 
  isOpen, 
  onClose, 
  onComplete,
  steps = [],
  title = "Tutorial"
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { isMobile } = useResponsive();

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const restart = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  if (!isOpen || steps.length === 0) return null;

  const currentStepData = steps[currentStep];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 5000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Tutorial Overlay */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: isMobile ? '100%' : '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: 0,
              color: '#111827'
            }}>
              {title}
            </h1>
            <p style={{
              color: '#6b7280',
              margin: '4px 0 0 0',
              fontSize: '14px'
            }}>
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <AccessibleButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X style={{ width: '20px', height: '20px' }} />}
          />
        </div>

        {/* Progress Bar */}
        <div style={{
          padding: '0 24px',
          paddingTop: '16px'
        }}>
          <div style={{
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#3b82f6',
              height: '100%',
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            {currentStepData.icon && (
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <currentStepData.icon style={{ 
                  width: '20px', 
                  height: '20px', 
                  color: '#3b82f6' 
                }} />
              </div>
            )}
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              margin: 0,
              color: '#111827'
            }}>
              {currentStepData.title}
            </h2>
          </div>

          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#374151',
            marginBottom: '20px'
          }}>
            {currentStepData.description}
          </p>

          {currentStepData.image && (
            <div style={{
              marginBottom: '20px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb'
            }}>
              <img
                src={currentStepData.image}
                alt={currentStepData.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>
          )}

          {currentStepData.highlights && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                margin: '0 0 8px 0',
                color: '#111827'
              }}>
                Key Points:
              </h4>
              <ul style={{
                margin: 0,
                paddingLeft: '20px'
              }}>
                {currentStepData.highlights.map((highlight, index) => (
                  <li key={index} style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <AccessibleButton
              variant="ghost"
              size="sm"
              onClick={restart}
              icon={<RotateCcw style={{ width: '16px', height: '16px' }} />}
              disabled={currentStep === 0}
            >
              {isMobile ? '' : 'Restart'}
            </AccessibleButton>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <AccessibleButton
              variant="secondary"
              onClick={prevStep}
              disabled={currentStep === 0}
              icon={<ChevronLeft style={{ width: '16px', height: '16px' }} />}
            >
              Previous
            </AccessibleButton>
            
            <AccessibleButton
              onClick={nextStep}
              icon={currentStep === steps.length - 1 ? 
                <CheckCircle style={{ width: '16px', height: '16px' }} /> :
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              }
            >
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            </AccessibleButton>
          </div>
        </div>
      </div>
    </div>
  );
};

// Help Button that triggers contextual help
export const HelpButton = ({ 
  helpContent, 
  tutorialSteps,
  position = 'bottom-right' 
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const positionStyles = {
    'bottom-right': { bottom: '24px', right: '24px' },
    'bottom-left': { bottom: '24px', left: '24px' },
    'top-right': { top: '24px', right: '24px' },
    'top-left': { top: '24px', left: '24px' }
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 2000
      }}>
        <AccessibleButton
          onClick={() => setShowHelp(true)}
          icon={<HelpCircle style={{ width: '20px', height: '20px' }} />}
          ariaLabel="Get help"
          style={{
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
        </AccessibleButton>
      </div>

      <ContextualHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        {...helpContent}
      />

      {tutorialSteps && (
        <InteractiveTutorial
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          onComplete={() => {
            // Mark tutorial as completed
            localStorage.setItem('tutorial_completed', 'true');
          }}
          steps={tutorialSteps}
        />
      )}
    </>
  );
};

// Hook for managing help state
export const useHelpSystem = () => {
  const [helpVisible, setHelpVisible] = useState(false);
  const [tutorialVisible, setTutorialVisible] = useState(false);

  const showHelp = () => setHelpVisible(true);
  const hideHelp = () => setHelpVisible(false);
  const showTutorial = () => setTutorialVisible(true);
  const hideTutorial = () => setTutorialVisible(false);

  const checkFirstVisit = (feature) => {
    const key = `first_visit_${feature}`;
    const isFirstVisit = !localStorage.getItem(key);
    if (isFirstVisit) {
      localStorage.setItem(key, 'true');
    }
    return isFirstVisit;
  };

  return {
    helpVisible,
    tutorialVisible,
    showHelp,
    hideHelp,
    showTutorial,
    hideTutorial,
    checkFirstVisit
  };
};

export default {
  Tooltip,
  HelpIcon,
  ContextualHelp,
  InteractiveTutorial,
  HelpButton,
  useHelpSystem
};