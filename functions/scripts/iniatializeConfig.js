const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

async function initializeConfigurations() {
  console.log('🚀 Inicializando configurações do FICA...');
  
  const configs = {
    risk_config: {
      thresholds: {
        low: { max: 30, color: '#4CAF50', icon: '✅' },
        medium: { min: 31, max: 60, color: '#FFC107', icon: '⚠️' },
        high: { min: 61, max: 80, color: '#FF9800', icon: '🔴' },
        critical: { min: 81, color: '#F44336', icon: '🚨' }
      },
      weights: {
        academic_performance: 0.25,
        attendance: 0.20,
        assignment_submission: 0.15,
        participation: 0.10,
        social_interaction: 0.10,
        financial_stress: 0.10,
        wellbeing_indicators: 0.10
      },
      calculation: {
        max_score: 100,
        min_data_points: 3,
        time_decay_days: 30
      },
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      version: '1.0.0'
    },
    
    notification_config: {
      templates: {
        risk_alert: {
          teacher: {
            subject: 'Alerta: Estudante em Risco {level}',
            body: 'O estudante {student_name} foi identificado com risco {level} no sistema FICA. Pontuação: {score}/100. Recomendamos {action}.',
            priority: 'high'
          },
          student: {
            subject: 'Suporte Disponível para Você',
            body: 'Olá {student_name}, notamos que você pode estar enfrentando alguns desafios. Queremos te lembrar que temos recursos disponíveis para te ajudar. {support_resources}',
            priority: 'medium'
          }
        },
        intervention_reminder: {
          subject: 'Lembrete: Acompanhamento Pendente',
          body: 'A intervenção para {student_name} está pendente há {days} dias. Tipo: {intervention_type}.'
        },
        weekly_summary: {
          subject: 'Resumo Semanal - Sistema FICA',
          body: 'Resumo da semana: {new_cases} novos casos, {resolved_cases} resolvidos, {active_cases} ativos.'
        }
      },
      delivery: {
        channels: ['email', 'in_app'],
        schedule: {
          daily_digest: '08:00',
          weekly_report: 'monday 09:00'
        },
        rate_limiting: {
          max_daily_per_user: 5,
          cool_down_minutes: 30
        }
      }
    },
    
    ui_config: {
      themes: {
        light: {
          primary: '#2196F3',
          secondary: '#FF9800',
          background: '#FFFFFF',
          text: '#333333'
        },
        dark: {
          primary: '#1976D2',
          secondary: '#FF5722',
          background: '#1A1A1A',
          text: '#FFFFFF'
        },
        high_contrast: {
          primary: '#000000',
          secondary: '#FFFFFF',
          background: '#FFFFFF',
          text: '#000000'
        }
      },
      accessibility: {
        min_font_size: 14,
        max_font_size: 24,
        animation_duration: 300,
        focus_visible: true
      },
      dashboard: {
        refresh_interval: 300000, // 5 minutos
        max_cards_per_page: 10,
        default_view: 'grid'
      }
    },
    
    system_config: {
      features: {
        real_time_updates: true,
        offline_mode: false,
        predictive_analytics: true,
        export_reports: true
      },
      limits: {
        max_students_per_teacher: 50,
        max_interventions_per_case: 10,
        data_retention_days: 365
      },
      maintenance: {
        backup_schedule: 'daily',
        performance_monitoring: true,
        error_reporting: true
      }
    }
  };
  
  try {
    const batch = db.batch();
    
    for (const [configName, configData] of Object.entries(configs)) {
      const configRef = db.collection('configurations').doc(configName);
      batch.set(configRef, configData, { merge: true });
      console.log(`✓ Configuração ${configName} inicializada`);
    }
    
    await batch.commit();
    console.log('✅ Todas as configurações foram inicializadas com sucesso!');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao inicializar configurações:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeConfigurations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initializeConfigurations };