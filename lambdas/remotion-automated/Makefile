# =========================
# Config (override via env)
# =========================
SLS ?= npx serverless
TSX ?= npx tsx
ORIGIN ?= http://localhost:3000

# ==============
# Phony targets
# ==============
.PHONY: help print-config install \
	test-single-slide test-concatenate \
	invoke-generate-slide invoke-concatenate invoke-render-status invoke-options \
	invoke-save-preferences invoke-generate-from-prompt invoke-generate-slide-image \
	invoke-generate-slide-audio invoke-generate-slide-video invoke-generate-slide-all \
	invoke-presentation-status deploy deploy-prod

help:
	@echo ""
	@echo "Remotion Automated Lambda - Available Commands:"
	@echo ""
	@echo "  make install                    Install dependencies"
	@echo ""
	@echo "  === Local Tests ==="
	@echo "  make test-single-slide          Run local single slide test"
	@echo "  make test-concatenate           Run local concatenation test"
	@echo ""
	@echo "  === Legacy Endpoints ==="
	@echo "  make invoke-generate-slide      Invoke generate-slide (legacy)"
	@echo "  make invoke-concatenate         Invoke concatenate-videos"
	@echo "  make invoke-render-status       Invoke render-status"
	@echo "  make invoke-options             Test OPTIONS preflight"
	@echo ""
	@echo "  === New Endpoints ==="
	@echo "  make invoke-save-preferences    Save slide/script preferences"
	@echo "  make invoke-generate-from-prompt Generate slides from AI prompt"
	@echo "  make invoke-generate-slide-image Generate slide PNG image"
	@echo "  make invoke-generate-slide-audio Generate slide audio (TTS)"
	@echo "  make invoke-generate-slide-video Generate video only (requires audio)"
	@echo "  make invoke-generate-slide-all  Generate all (audio + image + video)"
	@echo "  make invoke-presentation-status Get presentation status"
	@echo ""
	@echo "  === Deployment ==="
	@echo "  make deploy                     Deploy to AWS (dev stage)"
	@echo "  make deploy-prod                Deploy to AWS (prod stage)"
	@echo ""

print-config:
	@echo "SLS    = $(SLS)"
	@echo "TSX    = $(TSX)"
	@echo "ORIGIN = $(ORIGIN)"

# Install dependencies
install:
	npm install

# Helper macro for inline invocation
define INVOKE_INLINE
	@echo "Invoking via router: $(1) ..."
	@$(SLS) invoke local -f api -d "$$($(TSX) scripts/generate-events.ts --route $(1) --origin $(ORIGIN))"
endef

# === Legacy Endpoints ===

invoke-generate-slide:
	$(call INVOKE_INLINE,generateSlide)

invoke-concatenate:
	$(call INVOKE_INLINE,concatenateVideos)

invoke-render-status:
	$(call INVOKE_INLINE,renderStatus)

invoke-options:
	$(call INVOKE_INLINE,options)

# === New Endpoints ===

invoke-save-preferences:
	$(call INVOKE_INLINE,savePreferences)

invoke-generate-from-prompt:
	$(call INVOKE_INLINE,generateFromPrompt)

invoke-generate-slide-image:
	$(call INVOKE_INLINE,generateSlideImage)

invoke-generate-slide-audio:
	$(call INVOKE_INLINE,generateSlideAudio)

invoke-generate-slide-video:
	$(call INVOKE_INLINE,generateSlideVideo)

invoke-generate-slide-all:
	$(call INVOKE_INLINE,generateSlideAll)

invoke-presentation-status:
	$(call INVOKE_INLINE,presentationStatus)

invoke-health:
	$(call INVOKE_INLINE,health)

# Deploy commands
deploy:
	$(SLS) deploy

deploy-prod:
	$(SLS) deploy --stage prod
