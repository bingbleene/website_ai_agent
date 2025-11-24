import { Sparkles, Brain, Zap, Eye, Clock, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LearnMore() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#020617', color: 'white', minHeight: '100vh' }}>
      {/* HERO */}
      <section
        style={{
          padding: '5rem 1rem 3rem',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(15,23,42,0.55)',
              borderRadius: '999px',
              border: '1px solid rgba(148,163,184,0.5)',
              marginBottom: '1.5rem',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <Sparkles size={18} />
            <span>Bên trong cách vận hành AI News Hub</span>
          </div>

          <h1
            style={{
              fontSize: '46px',
              fontWeight: 800,
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            Tìm hiểu cách AI chọn lọc bản tin cho bạn
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: 'rgba(241,245,249,0.9)',
              maxWidth: '640px',
              margin: '0 auto 2.5rem',
            }}
          >
            AI News Hub thu thập hàng trăm nguồn tin công nghệ, dùng mô hình máy học để
            lọc nhiễu, xếp hạng và đề xuất những bài viết quan trọng nhất theo nhu cầu
            của bạn.
          </p>

          <button
            onClick={() => navigate('/articles')}
            style={{
              padding: '1rem 2.4rem',
              background: 'white',
              color: '#1d4ed8',
              borderRadius: '14px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Bắt đầu đọc ngay
          </button>
        </div>
      </section>

      {/* WHAT IS AI NEWS HUB */}
      <section style={{ padding: '4rem 1rem', background: '#020617' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '30px',
              fontWeight: 800,
              marginBottom: '1.25rem',
            }}
          >
            AI News Hub là gì?
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: '#9ca3af',
              maxWidth: '720px',
              marginBottom: '2.5rem',
            }}
          >
            Đây là nền tảng tin tức công nghệ/AI được thiết kế cho sinh viên, nhà
            nghiên cứu và người đi làm bận rộn. Thay vì phải tự lọc hàng loạt bài báo,
            hệ thống giúp bạn:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.75rem',
            }}
          >
            <div
              style={{
                padding: '1.6rem',
                borderRadius: '18px',
                background: '#020617',
                border: '1px solid rgba(148,163,184,0.4)',
              }}
            >
              <Brain size={28} />
              <h3
                style={{
                  marginTop: '1rem',
                  marginBottom: '0.5rem',
                  fontSize: '18px',
                  fontWeight: 700,
                }}
              >
                Dành cho người yêu công nghệ
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>
                Nắm bắt xu hướng AI, blockchain, startup… trong vài phút mỗi ngày với
                feed đã được tóm tắt và sắp xếp theo độ quan trọng.
              </p>
            </div>

            <div
              style={{
                padding: '1.6rem',
                borderRadius: '18px',
                background: '#020617',
                border: '1px solid rgba(148,163,184,0.4)',
              }}
            >
              <Zap size={28} />
              <h3
                style={{
                  marginTop: '1rem',
                  marginBottom: '0.5rem',
                  fontSize: '18px',
                  fontWeight: 700,
                }}
              >
                Dành cho team nội dung
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>
                Theo dõi đối thủ đang viết gì, chủ đề nào đang hot và những khoảng trống
                nội dung mà team của bạn có thể khai thác.
              </p>
            </div>

            <div
              style={{
                padding: '1.6rem',
                borderRadius: '18px',
                background: '#020617',
                border: '1px solid rgba(148,163,184,0.4)',
              }}
            >
              <Rocket size={28} />
              <h3
                style={{
                  marginTop: '1rem',
                  marginBottom: '0.5rem',
                  fontSize: '18px',
                  fontWeight: 700,
                }}
              >
                Dành cho sinh viên & nhà nghiên cứu
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>
                Tìm ý tưởng cho luận văn, bài thuyết trình hay đề tài nghiên cứu từ
                nguồn tin đã được hệ thống phân loại theo chủ đề và độ tin cậy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '4rem 1rem', background: '#020617' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '30px',
              fontWeight: 800,
              marginBottom: '1.25rem',
            }}
          >
            Hệ thống hoạt động như thế nào?
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: '#9ca3af',
              maxWidth: '720px',
              marginBottom: '2.5rem',
            }}
          >
            Quy trình xử lý tin tức của AI News Hub có thể tóm tắt thành 4 bước chính:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.75rem',
            }}
          >
            <div
              style={{
                padding: '1.6rem',
                borderRadius: '18px',
                background: '#020617',
                border: '1px solid rgba(55,65,81,0.8)',
              }}
            >
              <span style={{ fontSize: '12px', color: '#6b7280' }}>BƯỚC 1</span>
              <h3 style={{ margin: '0.4rem 0 0.5rem', fontSize: '17px' }}>
                Thu thập & làm sạch
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>
                Thu thập bài viết từ nhiều nguồn (blog, trang tin, báo cáo). Sau đó loại
                bỏ quảng cáo, phần trùng lặp và format lại nội dung.
              </p>
            </div>

            <div
              style={{
                padding: '1.6rem',
                borderRadius: '18px',
                background: '#020617',
                border: '1px solid rgba(55,65,81,0.8)',
              }}
            >
              <span style={{ fontSize: '12px', color: '#6b7280' }}>BƯỚC 2</span>
              <h3 style={{ margin: '0.4rem 0 0.5rem', fontSize: '17px' }}>
                Phân loại & xếp hạng
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>
                Mô hình AI gắn nhãn chủ đề (AI, Blockchain, Product, Policy, Research…)
                và tính điểm độ quan trọng dựa trên tần suất được nhắc tới, nguồn và mức
                độ liên quan.
              </p>
            </div>

            <div
              style={{
                padding: '1.6rem',
                borderRadius: '18px',
                background: '#020617',
                border: '1px solid rgba(55,65,81,0.8)',
              }}
            >
              <span style={{ fontSize: '12px', color: '#6b7280' }}>BƯỚC 3</span>
              <h3 style={{ margin: '0.4rem 0 0.5rem', fontSize: '17px' }}>
                Tóm tắt & làm nổi bật
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>
                Hệ thống tạo tóm tắt ngắn gọn, trích key points, thời lượng đọc dự kiến
                và gợi ý bài liên quan để bạn không bị ngợp thông tin.
              </p>
            </div>

            <div
              style={{
                padding: '1.6rem',
                borderRadius: '18px',
                background: '#020617',
                border: '1px solid rgba(55,65,81,0.8)',
              }}
            >
              <span style={{ fontSize: '12px', color: '#6b7280' }}>BƯỚC 4</span>
              <h3 style={{ margin: '0.4rem 0 0.5rem', fontSize: '17px' }}>
                Cá nhân hóa luồng tin
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>
                Mỗi hành vi xem – lưu – click của bạn giúp mô hình hiểu rõ sở thích hơn
                và đề xuất feed phù hợp hơn theo thời gian.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '4rem 1rem', background: '#020617' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '30px',
              fontWeight: 800,
              marginBottom: '1.25rem',
            }}
          >
            Những tính năng chính
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.75rem',
            }}
          >
            <div
              style={{
                padding: '1.6rem',
                borderRadius: '18px',
                background: '#020617',
                border: '1px solid rgba(148,163,184,0.5)',
              }}
            >
              <Eye size={22} />
              <h3 style={{ margin: '0.8rem 0 0.4rem', fontSize: '16px' }}>
                Trải nghiệm đọc tập trung
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                Giao diện tập trung vào nội dung, không spam pop-up, không bị đẩy sang
                quá nhiều tab.
              </p>
            </div>

            <div
              style={{
                padding: '1.6rem',
                borderRadius: '18px',
                background: '#020617',
                border: '1px solid rgba(148,163,184,0.5)',
              }}
            >
              <Clock size={22} />
              <h3 style={{ margin: '0.8rem 0 0.4rem', fontSize: '16px' }}>
                Tóm tắt gắn với thời gian
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                Mỗi bài đều hiển thị thời lượng đọc (phút đọc) để bạn dễ quyết định xem
                ngay hay lưu đọc sau.
              </p>
            </div>

            <div
              style={{
                padding: '1.6rem',
                borderRadius: '18px',
                background: '#020617',
                border: '1px solid rgba(148,163,184,0.5)',
              }}
            >
              <Rocket size={22} />
              <h3 style={{ margin: '0.8rem 0 0.4rem', fontSize: '16px' }}>
                Lộ trình ưu tiên AI
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                Dễ mở rộng thêm tính năng như gợi ý tài liệu học, chatbot hỏi – đáp theo
                nội dung bài viết, hoặc bảng điều khiển riêng cho giảng viên/doanh
                nghiệp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ + CTA */}
      <section
        style={{
          padding: '4rem 1rem 5rem',
          background: 'radial-gradient(circle at top, #0f172a, #020617 60%)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 800,
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            Câu hỏi thường gặp
          </h2>

          <div
            style={{
              display: 'grid',
              gap: '1.3rem',
              marginBottom: '3rem',
            }}
          >
            <div
              style={{
                padding: '1.1rem 1.3rem',
                borderRadius: '14px',
                background: '#020617',
                border: '1px solid rgba(51,65,85,0.9)',
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  marginBottom: '0.4rem',
                }}
              >
                AI News Hub có phải là trang tin chính thức không?
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                Đây là dự án demo/học tập, không phải cơ quan báo chí. Nội dung được
                trích dẫn từ các nguồn mở và dùng để minh hoạ cách ứng dụng AI trong
                quản lý tin tức.
              </p>
            </div>

            <div
              style={{
                padding: '1.1rem 1.3rem',
                borderRadius: '14px',
                background: '#020617',
                border: '1px solid rgba(51,65,85,0.9)',
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  marginBottom: '0.4rem',
                }}
              >
                Dữ liệu người dùng được lưu trữ như thế nào?
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                Hệ thống chỉ lưu những thông tin tối thiểu cần thiết (ví dụ bài bạn đã
                xem hoặc đã lưu) để cải thiện đề xuất, không bán cho bên thứ ba.
              </p>
            </div>

            <div
              style={{
                padding: '1.1rem 1.3rem',
                borderRadius: '14px',
                background: '#020617',
                border: '1px solid rgba(51,65,85,0.9)',
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  marginBottom: '0.4rem',
                }}
              >
                Trong tương lai sẽ thêm những tính năng gì?
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                Roadmap dự kiến có thể gồm: bản tin cá nhân hoá theo email, chatbot trả
                lời câu hỏi dựa trên bài viết, dashboard cho giảng viên/doanh nghiệp.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3
              style={{
                fontSize: '24px',
                fontWeight: 700,
                marginBottom: '0.75rem',
              }}
            >
              Sẵn sàng trải nghiệm thực tế?
            </h3>
            <p
              style={{
                fontSize: '15px',
                color: '#9ca3af',
                marginBottom: '1.8rem',
              }}
            >
              Quay lại trang chủ và thử khám phá các bài viết về AI & Blockchain ngay
              bây giờ.
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '0.9rem 2.1rem',
                background: 'white',
                color: '#1d4ed8',
                borderRadius: '12px',
                border: 'none',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Quay lại Trang chủ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
